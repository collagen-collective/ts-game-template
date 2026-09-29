import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 3000,
        // The end-to-end suite's server watches nothing: playwright.config.ts
        // sets E2E_SERVER, and `npm run dev` does not. A server that watches
        // reloads every page it serves when a file it serves changes. One that
        // does not reloads nothing, and serves each module as it was when it
        // was first asked for, so a run tests the code as it stood when it began.
        watch: process.env["E2E_SERVER"] ? null : undefined,
    },
});
