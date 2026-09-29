import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        // Any *.test.ts under src/ or tests/, wherever it was put. The merge
        // driver's tests in scripts/ always match, so a unit test outside the
        // pattern would not fail the run with "No test files found": it would
        // simply never run, and nothing would say so. tests/e2e/ is Playwright's.
        include: ["src/**/*.test.ts", "tests/**/*.test.ts", "scripts/**/__tests__/**/*.test.mjs"],
        exclude: [...configDefaults.exclude, "tests/e2e/**"],
    },
});
