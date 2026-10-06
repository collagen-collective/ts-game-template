/**
 * The stack as CloudFormation will be given it: every setting the console steps
 * once asked a person for, read off the synthesized template.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { FeedbackStack, type FeedbackProps } from "../lib/feedback-stack.ts";

const props: FeedbackProps = {
    env: { account: "123456789012", region: "us-east-2" },
    inbox: { repo: "o/inbox", branch: "main" },
    origins: ["https://main.d1234.amplifyapp.com"],
    logDays: 90,
};
const synth = (over: Partial<FeedbackProps> = {}) =>
    Template.fromStack(new FeedbackStack(new App(), "Feedback", { ...props, ...over }));

describe("the feedback stack", () => {
    const t = synth();

    it("runs the handler on Node 22, for 30 seconds with 256 MB, reading its settings from the secret", () => {
        t.hasResourceProperties("AWS::Lambda::Function", {
            Runtime: "nodejs22.x",
            Handler: "handler.handler",
            Timeout: 30,
            MemorySize: 256,
            Environment: {
                Variables: {
                    INBOX_REPO: "o/inbox",
                    INBOX_BRANCH: "main",
                    FEEDBACK_SECRET: { Ref: Match.stringLikeRegexp("^Settings") },
                },
            },
        });
    });

    it("keeps the token and the keys out of the function's environment and the template", () => {
        const text = JSON.stringify(t.toJSON());
        assert.doesNotMatch(text, /GITHUB_TOKEN"\s*:\s*"[^"]/);
        const fn = Object.values(t.findResources("AWS::Lambda::Function"))[0];
        assert.deepEqual(Object.keys(fn?.["Properties"]["Environment"]["Variables"]).sort(), [
            "FEEDBACK_SECRET",
            "INBOX_BRANCH",
            "INBOX_REPO",
        ]);
        t.hasResourceProperties("AWS::SecretsManager::Secret", {
            SecretString: JSON.stringify({ GITHUB_TOKEN: "", KEYS: "" }),
        });
    });

    it("lets the function read its secret and nothing else's", () => {
        t.hasResourceProperties("AWS::IAM::Policy", {
            PolicyDocument: {
                Statement: Match.arrayWith([
                    Match.objectLike({
                        Action: ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
                        Resource: { Ref: Match.stringLikeRegexp("^Settings") },
                    }),
                ]),
            },
        });
    });

    it("gives it an open address whose CORS lets exactly the game read a POST's answer", () => {
        t.hasResourceProperties("AWS::Lambda::Url", {
            AuthType: "NONE",
            Cors: {
                AllowOrigins: ["https://main.d1234.amplifyapp.com"],
                AllowMethods: ["POST"],
            },
        });
        // A public function URL needs both permissions since October 2025.
        t.hasResourceProperties("AWS::Lambda::Permission", {
            Action: "lambda:InvokeFunctionUrl",
            FunctionUrlAuthType: "NONE",
            Principal: "*",
        });
        t.hasResourceProperties("AWS::Lambda::Permission", {
            Action: "lambda:InvokeFunction",
            InvokedViaFunctionUrl: true,
            Principal: "*",
        });
    });

    it("keeps its log for as long as config.ts says", () => {
        t.hasResourceProperties("AWS::Logs::LogGroup", { RetentionInDays: 90 });
    });

    it("says where the function is and where its secret is", () => {
        for (const name of ["FunctionUrl", "SecretName", "FunctionName", "GameOrigin"])
            t.hasOutput(name, {});
    });

    it("refuses an origin with a slash at the end, a path, or the placeholder left in", () => {
        for (const origin of [
            "https://main.d1234.amplifyapp.com/",
            "https://main.d1234.amplifyapp.com/?key=x",
            "https://main.<app id>.amplifyapp.com",
            "main.d1234.amplifyapp.com",
        ])
            assert.throws(() => synth({ origins: [origin] }), /is not an origin/, origin);
    });

    it("takes config.ts once it is filled in, and refuses it while a placeholder is left", async () => {
        const { config } = await import("../config.ts");
        const fromConfig = () =>
            new FeedbackStack(new App(), config.stack, {
                env: { account: "123456789012", region: config.region },
                inbox: config.inbox,
                origins: config.origins,
                logDays: config.logDays,
            });
        if (config.stack.includes("<")) assert.throws(fromConfig, /is not a stack name/);
        else assert.doesNotThrow(fromConfig);
    });

    it("refuses a stack name or a region that is not one", () => {
        assert.throws(
            () => new FeedbackStack(new App(), "<Game>Feedback", props),
            /is not a stack name/,
        );
        assert.throws(
            () => synth({ env: { account: "123456789012", region: "<region>" } }),
            /is not an AWS region/,
        );
    });
});
