import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { describe, it, type TestContext } from "node:test";

type Settings = { GITHUB_TOKEN: string; KEYS: string };
type Version = { settings: Settings; stages: Set<string> };
type Result = { code: unknown; stdout: string; stderr: string };
type Request = {
    SecretString?: string;
    ClientRequestToken?: string;
    VersionStages?: string[];
    VersionStage?: string;
    RemoveFromVersionId?: string;
    MoveToVersionId?: string;
};
type Options = {
    simultaneousReads?: number;
    failCleanup?: boolean;
    failPromotion?: boolean;
    losePromotionResponse?: boolean;
    failCandidateResponse?: boolean;
    denyCandidate?: boolean;
};

/** The real CLI and SDK talk only to this local, dummy AWS endpoint. */
async function fixture(t: TestContext, options: Options = {}) {
    const simultaneousReads = options.simultaneousReads ?? 0;
    const versions = new Map<string, Version>([
        [
            "initial",
            {
                settings: { GITHUB_TOKEN: "github_pat_old", KEYS: "tester:old-key" },
                stages: new Set(["AWSCURRENT"]),
            },
        ],
    ]);
    let current = "initial";
    let reads = 0;
    let beforeRead: (() => void) | undefined;
    const pendingReads: (() => void)[] = [];
    const candidates: string[] = [];
    const promotions: Request[] = [];
    const reply = (res: ServerResponse, value: unknown, status = 200) => {
        res.writeHead(status, { "content-type": "application/x-amz-json-1.1" });
        res.end(JSON.stringify(value));
    };
    const server = createServer(async (req, res) => {
        let body = "";
        for await (const chunk of req) body += chunk;
        if (!req.headers["x-amz-target"]) {
            res.writeHead(200, { "content-type": "text/xml" });
            res.end(
                `<DescribeStacksResponse xmlns="http://cloudformation.amazonaws.com/doc/2010-05-15/"><DescribeStacksResult><Stacks><member><StackName>dummy</StackName><StackId>dummy</StackId><CreationTime>2026-01-01T00:00:00Z</CreationTime><StackStatus>CREATE_COMPLETE</StackStatus><Outputs>${Object.entries(
                    {
                        FunctionUrl: "https://function.example/",
                        SecretName: "dummy-settings",
                        FunctionName: "dummy-function",
                        GameOrigin: "https://game.example",
                    },
                )
                    .map(
                        ([key, value]) =>
                            `<member><OutputKey>${key}</OutputKey><OutputValue>${value}</OutputValue></member>`,
                    )
                    .join(
                        "",
                    )}</Outputs></member></Stacks></DescribeStacksResult></DescribeStacksResponse>`,
            );
            return;
        }
        const action = String(req.headers["x-amz-target"]).split(".").at(-1);
        const input: Request = JSON.parse(body);
        if (action === "GetSecretValue") {
            const version = current;
            const respond = () =>
                reply(res, {
                    VersionId: version,
                    SecretString: JSON.stringify(versions.get(version)!.settings),
                });
            reads++;
            if (simultaneousReads > 0 && reads <= simultaneousReads) {
                pendingReads.push(respond);
                if (pendingReads.length === simultaneousReads)
                    for (const release of pendingReads) release();
            } else respond();
            beforeRead?.();
            return;
        }
        if (action === "PutSecretValue") {
            if (options.denyCandidate) {
                reply(res, { __type: "AccessDeniedException", message: "Candidate denied." }, 400);
                return;
            }
            const version = input.ClientRequestToken ?? randomUUID();
            const stages = new Set(input.VersionStages ?? ["AWSCURRENT"]);
            versions.set(version, { settings: JSON.parse(input.SecretString!), stages });
            candidates.push(version);
            // AWS makes a normal PutSecretValue current immediately. Explicitly
            // staging candidates is what prevents a rejected write from leaking.
            if (stages.has("AWSCURRENT")) {
                versions.get(current)!.stages.delete("AWSCURRENT");
                current = version;
            }
            if (options.failCandidateResponse) {
                reply(
                    res,
                    { __type: "InternalServiceError", message: "Candidate response failed." },
                    500,
                );
                return;
            }
            reply(res, { VersionId: version });
            return;
        }
        if (action === "UpdateSecretVersionStage") {
            if (input.VersionStage === "AWSCURRENT") {
                promotions.push(input);
                if (options.failPromotion) {
                    reply(
                        res,
                        { __type: "AccessDeniedException", message: "Promotion denied." },
                        400,
                    );
                    return;
                }
                if (input.RemoveFromVersionId !== current) {
                    reply(
                        res,
                        {
                            __type: "InvalidParameterException",
                            message:
                                "RemoveFromVersionId does not match the version holding AWSCURRENT.",
                        },
                        400,
                    );
                    return;
                }
                versions.get(current)!.stages.delete("AWSCURRENT");
                current = input.MoveToVersionId!;
                versions.get(current)!.stages.add("AWSCURRENT");
                if (options.losePromotionResponse && promotions.length === 1) {
                    // AWS committed the update, but the SDK must retry because
                    // it never received the reply. That retry sees a stale base.
                    res.destroy();
                    return;
                }
            } else {
                if (options.failCleanup) {
                    reply(
                        res,
                        { __type: "AccessDeniedException", message: "Cleanup denied." },
                        400,
                    );
                    return;
                }
                const version = versions.get(input.RemoveFromVersionId!);
                if (!version) {
                    reply(
                        res,
                        { __type: "ResourceNotFoundException", message: "No candidate version." },
                        400,
                    );
                    return;
                }
                version.stages.delete(input.VersionStage!);
            }
            reply(res, {});
            return;
        }
        reply(
            res,
            { __type: "InvalidRequestException", message: `Unexpected operation ${action}` },
            400,
        );
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    t.after(
        () =>
            new Promise<void>((resolve, reject) =>
                server.close((error) => (error ? reject(error) : resolve())),
            ),
    );
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const endpoint = `http://127.0.0.1:${address.port}`;
    const cli = (...args: string[]) => {
        const child = spawn(
            process.execPath,
            ["--import", "./test/fixtures/dummy-config.ts", "scripts/secret.ts", ...args],
            {
                cwd: fileURLToPath(new URL("../", import.meta.url)),
                env: {
                    ...process.env,
                    AWS_ACCESS_KEY_ID: "dummy",
                    AWS_SECRET_ACCESS_KEY: "dummy",
                    AWS_SESSION_TOKEN: "dummy",
                    AWS_EC2_METADATA_DISABLED: "true",
                    AWS_MAX_ATTEMPTS: "2",
                    AWS_CONFIG_FILE: "/dev/null",
                    AWS_SHARED_CREDENTIALS_FILE: "/dev/null",
                    AWS_ENDPOINT_URL_CLOUDFORMATION: endpoint,
                    AWS_ENDPOINT_URL_SECRETS_MANAGER: endpoint,
                },
                stdio: ["pipe", "pipe", "pipe"],
            },
        );
        t.after(() => {
            child.kill();
        });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (chunk) => {
            stdout += chunk;
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk;
        });
        const result = once(child, "close").then(([code]) => ({ code, stdout, stderr }));
        return { child, result };
    };
    return {
        cli,
        settings: () => versions.get(current)!.settings,
        promotionCount: () => promotions.length,
        reads: (count: number, result: Promise<Result>) =>
            Promise.race([
                reads >= count
                    ? Promise.resolve()
                    : new Promise<void>((resolve) => {
                          beforeRead = () => {
                              if (reads >= count) resolve();
                          };
                      }),
                result.then((exited) =>
                    assert.fail(`The CLI exited before reading its settings: ${exited.stderr}`),
                ),
            ]),
        assertStagesClean: () => {
            assert.ok(candidates.length > 0);
            for (const version of candidates)
                assert.deepEqual(
                    [...versions.get(version)!.stages].filter((stage) =>
                        stage.startsWith("feedback-update-"),
                    ),
                    [],
                );
        },
    };
}

describe("concurrent credential commands", { timeout: 60_000 }, () => {
    for (const change of ["remove", "key"] as const) {
        it(`a delayed token prompt cannot undo a committed ${change}`, async (t) => {
            const aws = await fixture(t);
            const token = aws.cli("token");
            await aws.reads(1, token.result);
            const other = await aws.cli(change, change === "remove" ? "tester" : "other").result;
            assert.equal(other.code, 0, other.stderr);
            const committed = { ...aws.settings() };
            token.child.stdin.end("github_pat_new\n");
            const result = await token.result;
            assert.deepEqual(
                aws.settings(),
                committed,
                "the delayed token command must keep the committed key change",
            );
            assert.equal(result.code, 1);
            assert.match(result.stderr, /changed.*running|concurrent|conflict/i);
            assert.match(result.stderr, /again|retry/i);
            assert.doesNotMatch(result.stdout + result.stderr, /github_pat_new/);
            aws.assertStagesClean();
        });
    }

    it("a delayed bulk key import cannot restore a removed key", async (t) => {
        const aws = await fixture(t);
        const imported = aws.cli("keys");
        await aws.reads(1, imported.result);
        const removed = await aws.cli("remove", "tester").result;
        assert.equal(removed.code, 0, removed.stderr);
        imported.child.stdin.end("tester:old-key,other:imported-key\n");
        const result = await imported.result;
        assert.equal(
            aws.settings().KEYS,
            "",
            "a stale bulk import must not resurrect the revoked key",
        );
        assert.equal(result.code, 1);
        assert.match(result.stderr, /changed.*running|concurrent|conflict/i);
        aws.assertStagesClean();
    });

    it("AWS rejects one of two simultaneous writes based on the same version", async (t) => {
        const aws = await fixture(t, { simultaneousReads: 2 });
        const results = await Promise.all([
            aws.cli("key", "first").result,
            aws.cli("key", "second").result,
        ]);
        assert.deepEqual(results.map((result) => result.code).sort(), [0, 1]);
        const rejected = results.find((result) => result.code === 1)!;
        assert.match(rejected.stderr, /changed.*running|concurrent|conflict/i);
        const succeeded =
            results.findIndex((result) => result.code === 0) === 0 ? "first" : "second";
        const failed = succeeded === "first" ? "second" : "first";
        assert.match(aws.settings().KEYS, new RegExp(`${succeeded}:[A-Za-z0-9]{32}`));
        assert.doesNotMatch(aws.settings().KEYS, new RegExp(`${failed}:`));
        assert.match(aws.settings().KEYS, /tester:old-key/);
        aws.assertStagesClean();
    });

    it("sequential commands keep the token, keys and links working", async (t) => {
        const aws = await fixture(t);
        const token = aws.cli("token");
        token.child.stdin.end("github_pat_new\n");
        const rotated = await token.result;
        assert.equal(rotated.code, 0, rotated.stderr);
        const granted = await aws.cli("key", "other").result;
        assert.equal(granted.code, 0, granted.stderr);
        const key = /other:([A-Za-z0-9]{32})/.exec(aws.settings().KEYS)?.[1];
        assert.ok(key);
        const removed = await aws.cli("remove", "tester").result;
        assert.equal(removed.code, 0, removed.stderr);
        const listed = await aws.cli("list").result;
        assert.equal(listed.code, 0, listed.stderr);
        assert.equal(aws.settings().GITHUB_TOKEN, "github_pat_new");
        assert.equal(aws.settings().KEYS, `other:${key}`);
        assert.match(listed.stdout, new RegExp(`other: https://game.example/\\?key=${key}`));
        assert.doesNotMatch(listed.stdout, /tester:|github_pat_new/);
    });

    it("keeps a successful rotation successful when temporary-label cleanup fails", async (t) => {
        const aws = await fixture(t, { failCleanup: true });
        const result = await aws.cli("key", "other").result;
        assert.equal(result.code, 0, result.stderr);
        const key = /other:([A-Za-z0-9]{32})/.exec(aws.settings().KEYS)?.[1];
        assert.ok(key);
        assert.match(result.stdout, new RegExp(`https://game.example/\\?key=${key}`));
        assert.match(result.stderr, /temporary staging label.*could not be removed/);
        assert.doesNotMatch(result.stderr, /Run this command again|github_pat_old/);
    });

    it("confirms a successful publication after a lost response and an SDK retry", async (t) => {
        const aws = await fixture(t, { losePromotionResponse: true });
        const result = await aws.cli("key", "other").result;
        assert.equal(result.code, 0, result.stderr);
        assert.ok(
            aws.promotionCount() >= 2,
            "the actual AWS SDK must retry the interrupted request",
        );
        const key = /other:([A-Za-z0-9]{32})/.exec(aws.settings().KEYS)?.[1];
        assert.ok(key);
        assert.match(result.stdout, new RegExp(`https://game.example/\\?key=${key}`));
        assert.equal(result.stderr, "");
        aws.assertStagesClean();
    });

    it("reports a denied publication without exposing or publishing its candidate", async (t) => {
        const aws = await fixture(t, { failPromotion: true });
        const result = await aws.cli("key", "other").result;
        assert.equal(result.code, 1);
        assert.deepEqual(aws.settings(), {
            GITHUB_TOKEN: "github_pat_old",
            KEYS: "tester:old-key",
        });
        assert.match(result.stderr, /Promotion denied/);
        assert.doesNotMatch(result.stdout + result.stderr, /github_pat_old|Their link/);
        aws.assertStagesClean();
    });

    it("cleans an inactive candidate even when its write response fails through SDK retries", async (t) => {
        const aws = await fixture(t, { failCandidateResponse: true });
        const result = await aws.cli("key", "other").result;
        assert.equal(result.code, 1);
        assert.deepEqual(aws.settings(), {
            GITHUB_TOKEN: "github_pat_old",
            KEYS: "tester:old-key",
        });
        assert.match(result.stderr, /Candidate response failed/);
        assert.doesNotMatch(result.stdout + result.stderr, /github_pat_old|Their link/);
        assert.equal(aws.promotionCount(), 0);
        aws.assertStagesClean();
    });

    it("keeps a rejected candidate write failed when cleanup finds no version", async (t) => {
        const aws = await fixture(t, { denyCandidate: true });
        const result = await aws.cli("key", "other").result;
        assert.equal(result.code, 1);
        assert.deepEqual(aws.settings(), {
            GITHUB_TOKEN: "github_pat_old",
            KEYS: "tester:old-key",
        });
        assert.equal(result.stdout, "");
        assert.equal(result.stderr, "Candidate denied.\n");
        assert.equal(aws.promotionCount(), 0);
    });
});
