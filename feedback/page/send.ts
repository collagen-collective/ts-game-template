/**
 * Where a report goes, and the key that lets it in. On the dev server, its own
 * inbox (`/__feedback`, `vite.config.ts`), a folder on disk; on a built game,
 * the feedback function at `VITE_FEEDBACK_URL`, which `npm run deploy` in
 * `infra/` writes to `.env.production`. The key comes in the player's link
 * (`?key=`), is kept by this browser, and is taken out of the address bar, so
 * that it is in no frame they share and no bookmark of the open game.
 */

/** Vite's `import.meta.env`, read without needing Vite's types. */
function env(): Record<string, unknown> {
    return (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {};
}

/** Where a report is sent here, or "" where there is nowhere. */
export function endpoint(): string {
    const e = env();
    if (e["DEV"] === true) return "/__feedback";
    return typeof e["VITE_FEEDBACK_URL"] === "string" ? e["VITE_FEEDBACK_URL"] : "";
}

/** Whether this is the dev server, which needs no key. */
export const isDev = (): boolean => env()["DEV"] === true;

/** The key the link carried, or the one this browser kept, or null. */
export function takeKey(storageKey: string): string | null {
    const given = new URLSearchParams(location.search).get("key");
    try {
        if (given) {
            localStorage.setItem(storageKey, given);
            const url = new URL(location.href);
            url.searchParams.delete("key");
            history.replaceState(history.state, "", url.toString());
        }
        return given ?? localStorage.getItem(storageKey);
    } catch {
        // A browser that refuses storage keeps it for this visit.
        return given;
    }
}

export type Answer = { ok: true; folder: string } | { ok: false; error: string };

export async function post(url: string, body: object): Promise<Answer> {
    let res: Response;
    try {
        // As text: a plain POST, which a function's address answers without a
        // preflight of its own, so its CORS needs only the site's origin.
        res = await fetch(url, {
            method: "POST",
            headers: { "content-type": "text/plain;charset=UTF-8" },
            body: JSON.stringify(body),
        });
    } catch {
        return { ok: false, error: "the inbox did not answer" };
    }
    const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        folder?: string;
        error?: string;
    };
    if (res.ok && json.ok && json.folder) return { ok: true, folder: json.folder };
    return { ok: false, error: json.error ?? `the inbox answered ${res.status}` };
}
