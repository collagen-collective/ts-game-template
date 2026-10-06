/**
 * After a deploy: the function's address into the game's build, as
 * `VITE_FEEDBACK_URL` in `.env.production` at the repository's root, which
 * Vite reads when it builds the hosted game. Commit the file, and the next
 * build offers FEEDBACK to a browser holding a key. Run on its own
 * (`node scripts/endpoint.ts`) it reads the address from the deployed stack.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { outputs } from "./stack.ts";

const ENV_FILE = fileURLToPath(new URL("../../.env.production", import.meta.url));
const NAME = "VITE_FEEDBACK_URL";

/** `text` with `NAME` set to `url`, every other line as it was. */
export function withUrl(text: string, url: string): string {
    const line = `${NAME}=${url}`;
    const body = text.replace(/\n+$/, "");
    const lines = body ? body.split("\n") : [];
    const at = lines.findIndex((l) => l.startsWith(`${NAME}=`));
    if (at >= 0) lines[at] = line;
    else lines.push(line);
    return `${lines.join("\n")}\n`;
}

if (import.meta.main) {
    const { FunctionUrl } = await outputs();
    const before = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";
    const after = withUrl(before, FunctionUrl);
    if (after === before) {
        console.log(`.env.production already has ${NAME}=${FunctionUrl}`);
    } else {
        writeFileSync(ENV_FILE, after);
        console.log(
            `.env.production: ${NAME}=${FunctionUrl}\nCommit it, and the next build of main sends there.`,
        );
    }
}
