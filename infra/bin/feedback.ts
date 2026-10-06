/**
 * The CDK app: one stack, the feedback function's, from `config.ts`. Deployed
 * to whichever account the AWS credentials in use belong to.
 */
import { App } from "aws-cdk-lib";
import { config } from "../config.ts";
import { FeedbackStack } from "../lib/feedback-stack.ts";

const app = new App();
new FeedbackStack(app, config.stack, {
    env: { account: process.env["CDK_DEFAULT_ACCOUNT"], region: config.region },
    inbox: config.inbox,
    origins: config.origins,
    logDays: config.logDays,
});
