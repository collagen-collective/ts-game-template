import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { withUrl } from "../scripts/endpoint.ts";
import { formatKeys, link, makeKey, NAME, parseKeys } from "../scripts/secret.ts";
// The function's own reading of KEYS, so the two cannot drift apart.
import { whoHolds } from "../../feedback/handler.mjs";

describe("the keys", () => {
    it("are 32 letters and digits, which a link and KEYS both carry whole", () => {
        for (let i = 0; i < 50; i++) assert.match(makeKey(), /^[A-Za-z0-9]{32}$/);
    });

    it("are written so that the function knows each holder by their key", () => {
        const keys = parseKeys("tester:abc123, person:def456");
        const tester = makeKey();
        keys.set("tester", tester);
        keys.set("other", "xyz789");
        const written = formatKeys(keys);
        assert.equal(written, `tester:${tester},person:def456,other:xyz789`);
        assert.equal(whoHolds(tester, written), "tester");
        assert.equal(whoHolds("abc123", written), null);
        assert.equal(whoHolds("xyz789", written), "other");
    });

    it("are given only to names a report's folder keeps as they are", () => {
        for (const ok of ["tester", "person-2"]) assert.match(ok, NAME);
        for (const bad of ["Tester", "a b", "x:y", "a,b", ""]) assert.doesNotMatch(bad, NAME);
    });

    it("go on the end of the game's address", () => {
        assert.equal(
            link("https://main.d1.amplifyapp.com", "K3y"),
            "https://main.d1.amplifyapp.com/?key=K3y",
        );
    });
});

describe(".env.production", () => {
    it("gains the address, or has it replaced, and keeps every other line", () => {
        assert.equal(withUrl("", "https://a/"), "VITE_FEEDBACK_URL=https://a/\n");
        assert.equal(withUrl("X=1\n", "https://a/"), "X=1\nVITE_FEEDBACK_URL=https://a/\n");
        assert.equal(
            withUrl("# c\nVITE_FEEDBACK_URL=https://old/\nX=1\n", "https://a/"),
            "# c\nVITE_FEEDBACK_URL=https://a/\nX=1\n",
        );
    });
});
