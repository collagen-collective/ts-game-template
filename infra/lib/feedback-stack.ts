import { fileURLToPath } from "node:url";
import {
    CfnOutput,
    Duration,
    RemovalPolicy,
    SecretValue,
    Stack,
    type StackProps,
} from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import type { Construct } from "constructs";

/** The folder that holds the function, `feedback/handler.mjs`, at the repository's root. */
export const FUNCTION_DIR = fileURLToPath(new URL("../../feedback/", import.meta.url));

export interface FeedbackProps extends StackProps {
    inbox: { repo: string; branch: string };
    origins: string[];
    logDays: number;
}

/**
 * The feedback function's AWS side: the function that `feedback/handler.mjs`
 * is, its address, its log, and the secret that holds the GitHub token and the
 * keys. Each setting that Extra Sapien's console steps once asked a person for
 * is here, with the reason it is what it is: every one of them was a default
 * that outlived a step written in a phrase, found by its first live send.
 */
export class FeedbackStack extends Stack {
    constructor(scope: Construct, id: string, props: FeedbackProps) {
        if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(id))
            throw new Error(
                `infra/config.ts: the stack ${JSON.stringify(id)} is not a stack name. Give it ` +
                    "letters, digits and dashes, starting with a letter.",
            );
        const region = props.env?.region ?? "";
        if (!/^[a-z]{2}(-[a-z]+)+-\d$/.test(region))
            throw new Error(
                `infra/config.ts: the region ${JSON.stringify(region)} is not an AWS region.`,
            );
        super(scope, id, props);
        for (const origin of props.origins) {
            if (!/^https?:\/\/[^/<>\s]+$/.test(origin))
                throw new Error(
                    `infra/config.ts: ${JSON.stringify(origin)} is not an origin. Give the game's ` +
                        "address as the browser shows it, with no path and no slash at the end.",
                );
        }
        if (!/^[\w.-]+\/[\w.-]+$/.test(props.inbox.repo))
            throw new Error(
                `infra/config.ts: the inbox ${JSON.stringify(props.inbox.repo)} is not owner/name.`,
            );

        // The token and the keys, as JSON. Made empty: `npm run secret` fills it,
        // and a deploy never writes it again, so what is put there stays.
        const secret = new secretsmanager.Secret(this, "Settings", {
            description: `The feedback function's GitHub token and keys (${id}).`,
            secretObjectValue: {
                GITHUB_TOKEN: SecretValue.unsafePlainText(""),
                KEYS: SecretValue.unsafePlainText(""),
            },
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const log = new logs.LogGroup(this, "Log", {
            retention: props.logDays as logs.RetentionDays,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const fn = new lambda.Function(this, "Function", {
            description: "Takes a report from the game and commits it to the feedback inbox.",
            runtime: lambda.Runtime.NODEJS_22_X,
            architecture: lambda.Architecture.ARM_64,
            // The handler alone: its tests stay behind.
            code: lambda.Code.fromAsset(FUNCTION_DIR, { exclude: ["__tests__"] }),
            handler: "handler.handler",
            // A send is ten calls to GitHub, one after another: Lambda's default
            // of 3 seconds cut Extra Sapien's first live one off partway.
            timeout: Duration.seconds(30),
            // Extra Sapien's first live report, 1.1 MB, used 112 MB of the default 128.
            memorySize: 256,
            environment: {
                INBOX_REPO: props.inbox.repo,
                INBOX_BRANCH: props.inbox.branch,
                FEEDBACK_SECRET: secret.secretArn,
            },
            logGroup: log,
        });
        secret.grantRead(fn);

        // Open to anyone with the address; the key in each report is the lock,
        // checked before GitHub is asked anything. The game sends its report as
        // text, a request that needs no preflight, so CORS only has to name the
        // game's origin for it to read the answer.
        const url = fn.addFunctionUrl({
            authType: lambda.FunctionUrlAuthType.NONE,
            cors: {
                allowedOrigins: props.origins,
                allowedMethods: [lambda.HttpMethod.POST],
                allowedHeaders: ["content-type"],
                maxAge: Duration.days(1),
            },
        });

        new CfnOutput(this, "FunctionUrl", {
            value: url.url,
            description: "The function's address: VITE_FEEDBACK_URL, in .env.production.",
        });
        new CfnOutput(this, "SecretName", {
            value: secret.secretName,
            description: "The secret `npm run secret` writes the token and the keys to.",
        });
        new CfnOutput(this, "FunctionName", { value: fn.functionName });
        new CfnOutput(this, "GameOrigin", { value: props.origins[0] ?? "" });
    }
}
