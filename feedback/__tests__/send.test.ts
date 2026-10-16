import { afterEach, describe, expect, it, vi } from "vitest";
import { takeKey } from "../page/send.ts";

afterEach(() => vi.unstubAllGlobals());

function browser(address = "https://game.example/play?mode=night#pause") {
    const location = new URL(address);
    const state = { screen: "pause" };
    const replaceState = vi.fn((_state: unknown, _title: string, address: string) => {
        location.href = address;
    });
    const storage = {
        getItem: vi.fn((_key: string): string | null => null),
        setItem: vi.fn<Storage["setItem"]>(),
    };
    vi.stubGlobal("location", location);
    vi.stubGlobal("history", { state, replaceState });
    vi.stubGlobal("localStorage", storage);
    return { location, state, replaceState, storage };
}

function denyStorageAccess() {
    Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        get() {
            throw new DOMException("Storage is blocked", "SecurityError");
        },
    });
}

describe("the feedback link's key", () => {
    it("keeps the first key and removes every key parameter while preserving the rest of the URL and history state", () => {
        const { location, state, replaceState, storage } = browser(
            "https://game.example/play?scene=bridge&key=first&mode=night&key=second#pause",
        );

        expect(takeKey("this-game:key")).toBe("first");

        expect(storage.setItem).toHaveBeenCalledWith("this-game:key", "first");
        expect(storage.getItem).not.toHaveBeenCalled();
        expect(location.href).toBe("https://game.example/play?scene=bridge&mode=night#pause");
        expect(replaceState).toHaveBeenCalledExactlyOnceWith(state, "", location.href);
        expect(replaceState.mock.calls[0]![0]).toBe(state);
    });

    it.each(["getter", "setItem"])(
        "removes the key and returns it for this visit when the localStorage %s throws",
        (blocked) => {
            const { location, state, replaceState, storage } = browser(
                "https://game.example/play?mode=night&key=visit-key#pause",
            );
            if (blocked === "getter") denyStorageAccess();
            else
                storage.setItem.mockImplementation(() => {
                    throw new DOMException("Storage is full", "QuotaExceededError");
                });

            expect(takeKey("this-game:key")).toBe("visit-key");

            expect(location.href).toBe("https://game.example/play?mode=night#pause");
            expect(replaceState).toHaveBeenCalledExactlyOnceWith(state, "", location.href);
        },
    );

    it("removes an empty key parameter too", () => {
        const { location, storage } = browser("https://game.example/play?key=&mode=night#pause");

        expect(takeKey("this-game:key")).toBe("");

        expect(location.href).toBe("https://game.example/play?mode=night#pause");
        expect(storage.setItem).not.toHaveBeenCalled();
        expect(storage.getItem).not.toHaveBeenCalled();
    });

    it("uses the stored key without replacing history when the link has none", () => {
        const { location, replaceState, storage } = browser();
        storage.getItem.mockReturnValue("stored-key");

        expect(takeKey("this-game:key")).toBe("stored-key");

        expect(storage.getItem).toHaveBeenCalledExactlyOnceWith("this-game:key");
        expect(storage.setItem).not.toHaveBeenCalled();
        expect(replaceState).not.toHaveBeenCalled();
        expect(location.href).toBe("https://game.example/play?mode=night#pause");
    });

    it("returns null when neither the link nor storage has a key", () => {
        browser();
        expect(takeKey("this-game:key")).toBeNull();
    });

    it.each(["getter", "getItem"])(
        "returns null when the link has no key and the localStorage %s throws",
        (blocked) => {
            const { replaceState, storage } = browser();
            if (blocked === "getter") denyStorageAccess();
            else
                storage.getItem.mockImplementation(() => {
                    throw new DOMException("Storage is blocked", "SecurityError");
                });

            expect(takeKey("this-game:key")).toBeNull();

            expect(replaceState).not.toHaveBeenCalled();
        },
    );
});
