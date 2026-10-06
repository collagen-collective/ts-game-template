/** What the deployed stack says about itself: its outputs, read from CloudFormation. */
import { CloudFormationClient, DescribeStacksCommand } from "@aws-sdk/client-cloudformation";
import { config } from "../config.ts";

export type Outputs = {
    FunctionUrl: string;
    SecretName: string;
    FunctionName: string;
    GameOrigin: string;
};

export async function outputs(): Promise<Outputs> {
    const cf = new CloudFormationClient({ region: config.region });
    let stack;
    try {
        const got = await cf.send(new DescribeStacksCommand({ StackName: config.stack }));
        stack = got.Stacks?.[0];
    } catch (e) {
        throw new Error(
            `The stack ${config.stack} could not be read in ${config.region}: ${(e as Error).message}\n` +
                "Is it deployed (npm run deploy), and are these the AWS credentials it was deployed with?",
            { cause: e },
        );
    }
    const got = Object.fromEntries((stack?.Outputs ?? []).map((o) => [o.OutputKey, o.OutputValue]));
    for (const k of ["FunctionUrl", "SecretName", "FunctionName", "GameOrigin"])
        if (!got[k])
            throw new Error(`The stack ${config.stack} has no output ${k}. Deploy it again.`);
    return got as Outputs;
}
