/**
 * The token and the keys, in the secret the function reads (`FEEDBACK_SECRET`,
 * `feedback/handler.mjs`). The function reads the secret again within five
 * minutes of a change, so none of these needs a deploy.
 *
 *   npm run secret -- token          the GitHub token, typed or piped in
 *   npm run secret -- key <name>     a new key for <name>, and the link that carries it;
 *                                    an old key of theirs stops working
 *   npm run secret -- remove <name>  <name>'s key, gone
 *   npm run secret -- list           who holds a key, and each one's link
 *   npm run secret -- keys           every key at once, as `KEYS` was written in the console
 *                                    (`tester:3f9c…,person:…`), typed or piped in, so that
 *                                    links already given out keep working
 */
import { randomInt } from "node:crypto";
import { createInterface } from "node:readline/promises";
import {
    GetSecretValueCommand,
    PutSecretValueCommand,
    SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { config } from "../config.ts";
import { outputs } from "./stack.ts";

type Settings = { GITHUB_TOKEN: string; KEYS: string };

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * A key: 32 letters and digits, so that a link carries it whole (in a link `+`
 * becomes a space and `&` or `#` ends it, and in `KEYS` a comma ends it).
 */
export function makeKey(length = 32): string {
    let key = "";
    for (let i = 0; i < length; i++) key += ALPHABET[randomInt(ALPHABET.length)];
    return key;
}

/** `KEYS` as name to key, in order. */
export function parseKeys(keys: string): Map<string, string> {
    const out = new Map<string, string>();
    for (const pair of keys.split(",")) {
        const i = pair.indexOf(":");
        if (i < 1) continue;
        out.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
    }
    return out;
}

export function formatKeys(keys: Map<string, string>): string {
    return [...keys].map(([name, key]) => `${name}:${key}`).join(",");
}

/** A name as a report's folder will hold it (`folderOf`, `feedback/handler.mjs`). */
export const NAME = /^[a-z0-9][a-z0-9-]{0,30}$/;

export const link = (origin: string, key: string): string => `${origin}/?key=${key}`;

async function readHidden(prompt: string): Promise<string> {
    if (!process.stdin.isTTY) {
        let text = "";
        for await (const chunk of process.stdin) text += chunk;
        return text.trim();
    }
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    // Typed characters are not echoed: only the prompt is written.
    const out = rl as unknown as { _writeToOutput: (s: string) => void };
    out._writeToOutput = (s: string) => {
        if (s.startsWith(prompt)) process.stdout.write(prompt);
    };
    const answer = await rl.question(prompt);
    rl.close();
    process.stdout.write("\n");
    return answer.trim();
}

async function main(args: string[]): Promise<void> {
    const [command, name] = args;
    const { SecretName, GameOrigin } = await outputs();
    const sm = new SecretsManagerClient({ region: config.region });
    const got = await sm.send(new GetSecretValueCommand({ SecretId: SecretName }));
    const settings: Settings = {
        GITHUB_TOKEN: "",
        KEYS: "",
        ...JSON.parse(got.SecretString ?? "{}"),
    };
    const keys = parseKeys(settings.KEYS);
    const save = () =>
        sm.send(
            new PutSecretValueCommand({
                SecretId: SecretName,
                SecretString: JSON.stringify({ ...settings, KEYS: formatKeys(keys) }),
            }),
        );

    switch (command) {
        case "token": {
            const token = await readHidden("The inbox's GitHub token: ");
            if (!token) throw new Error("No token given; nothing changed.");
            if (!token.startsWith("github_pat_"))
                console.warn(
                    "That does not look like a fine-grained token (github_pat_…); kept anyway.",
                );
            settings.GITHUB_TOKEN = token;
            await save();
            console.log(`The token is in ${SecretName}. The function uses it within five minutes.`);
            return;
        }
        case "key": {
            if (!name || !NAME.test(name))
                throw new Error(
                    "Give a name of lower-case letters, digits and dashes: npm run secret -- key tester",
                );
            const had = keys.has(name);
            const key = makeKey();
            keys.set(name, key);
            await save();
            console.log(
                `${had ? "A new key for" : "A key for"} ${name}${had ? "; the old one stops working" : ""}.`,
            );
            console.log(`Their link, within five minutes:\n\n  ${link(GameOrigin, key)}\n`);
            return;
        }
        case "remove": {
            if (!name || !keys.delete(name))
                throw new Error(`No key is held by ${JSON.stringify(name ?? "")}.`);
            await save();
            console.log(
                `${name}'s key is gone. Their reports are turned away within five minutes.`,
            );
            return;
        }
        case "keys": {
            const given = parseKeys(
                await readHidden("KEYS, as name:key pairs separated by commas: "),
            );
            if (given.size === 0) throw new Error("No name:key pairs given; nothing changed.");
            for (const n of given.keys())
                if (!NAME.test(n))
                    throw new Error(`${JSON.stringify(n)} is not a name a report's folder keeps.`);
            keys.clear();
            for (const [n, k] of given) keys.set(n, k);
            await save();
            console.log(
                `${[...given.keys()].join(", ")} hold keys. Their links work within five minutes.`,
            );
            return;
        }
        case "list": {
            console.log(
                `Token: ${settings.GITHUB_TOKEN ? "set" : "NOT SET (npm run secret -- token)"}`,
            );
            if (keys.size === 0) console.log("No keys yet (npm run secret -- key <name>).");
            for (const [n, k] of keys) console.log(`${n}: ${link(GameOrigin, k)}`);
            return;
        }
        default:
            throw new Error("npm run secret -- token | key <name> | remove <name> | list | keys");
    }
}

if (import.meta.main) {
    try {
        await main(process.argv.slice(2));
    } catch (e) {
        console.error((e as Error).message);
        process.exitCode = 1;
    }
}
