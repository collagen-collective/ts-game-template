import { registerHooks } from "node:module";

// Run the actual credential CLI without filling in the template's real config.
// Its AWS SDK clients are directed to the test's local endpoint by environment.
const configUrl = new URL("../../config.ts", import.meta.url).href;
registerHooks({
    load(url, context, nextLoad) {
        if (url === configUrl)
            return {
                format: "module",
                shortCircuit: true,
                source: 'export const config = { region: "us-east-1", stack: "DummyFeedback" };',
            };
        return nextLoad(url, context);
    },
});
