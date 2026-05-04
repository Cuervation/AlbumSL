import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const firebaseAuthMock = vi.hoisted(() => ({
  currentUser: null as null | { readonly getIdToken: () => Promise<string> },
}));

vi.mock("../../lib/firebase", () => ({
  firebaseAuth: firebaseAuthMock,
  firestoreDb: {},
  firebaseFunctions: {},
}));

vi.mock("../sticker-catalog/sticker-catalog.service", () => ({
  getActiveStickers: vi.fn(async () => []),
}));

describe("album.service pasteSticker", () => {
  let pasteSticker: (stickerId: string) => Promise<{ readonly stickerId: string }>;

  beforeAll(async () => {
    pasteSticker = (await import("./album.service")).pasteSticker;
  });

  beforeEach(() => {
    firebaseAuthMock.currentUser = null;
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.stubEnv("VITE_ALBUMSL_API_BASE_URL", "http://localhost:8081");
  });

  it("fails without an authenticated user", async () => {
    await expect(pasteSticker("sticker-1")).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
  });

  it("sends the Firebase ID token to the backend", async () => {
    firebaseAuthMock.currentUser = {
      getIdToken: async () => "id-token-1",
    };
    const fetchMock = vi.fn(async () =>
      Response.json({
        stickerId: "sticker-1",
        quantity: 2,
        pastedQuantity: 1,
        repeatedQuantity: 1,
        albumProgress: {
          totalStickers: 33,
          collectedStickers: 1,
          pastedStickers: 1,
          repeatedStickers: 1,
          completionPercentage: 3,
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await pasteSticker("sticker-1");

    expect(response.stickerId).toBe("sticker-1");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8081/api/stickers/paste",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer id-token-1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stickerId: "sticker-1" }),
      }),
    );
  });

  it("maps backend API errors", async () => {
    firebaseAuthMock.currentUser = {
      getIdToken: async () => "id-token-1",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          {
            error: {
              code: "INSUFFICIENT_QUANTITY",
              message: "User does not have an available sticker to paste",
            },
          },
          { status: 409 },
        ),
      ),
    );

    await expect(pasteSticker("sticker-1")).rejects.toMatchObject({
      code: "INSUFFICIENT_QUANTITY",
      message: "User does not have an available sticker to paste",
    });
  });
});
