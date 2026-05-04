import type { ClaimDailyPackRequestDto } from "@albumsl/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";

const firebaseAuthMock = vi.hoisted(() => ({
  currentUser: null as null | { readonly getIdToken: () => Promise<string> },
}));

const openPackCallableMock = vi.hoisted(() =>
  vi.fn(async () => ({
    data: {
      packOpeningId: "opening-1",
      source: "DAILY",
      stickers: [],
      newCount: 0,
      repeatedCount: 0,
      createdAt: "2026-05-03T00:00:00.000Z",
    },
  })),
);

const httpsCallableMock = vi.hoisted(() => vi.fn(() => openPackCallableMock));

vi.mock("../../lib/firebase", () => ({
  firebaseAuth: firebaseAuthMock,
  firebaseFunctions: {},
}));

vi.mock("firebase/functions", () => ({
  httpsCallable: httpsCallableMock,
}));

describe("pack-opening.service", () => {
  beforeEach(() => {
    firebaseAuthMock.currentUser = null;
    openPackCallableMock.mockClear();
    httpsCallableMock.mockClear();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.stubEnv("VITE_ALBUMSL_API_BASE_URL", "http://localhost:8081");
  });

  it("claimDailyPack fails without an authenticated user", async () => {
    const { claimDailyPack } = await import("./pack-opening.service");

    await expect(claimDailyPack()).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
  });

  it("claimDailyPack sends the Firebase ID token to the backend", async () => {
    firebaseAuthMock.currentUser = {
      getIdToken: async () => "id-token-1",
    };
    const fetchMock = vi.fn(async () =>
      Response.json({
        claimId: "daily_user-1_2026-05-03",
        source: "DAILY",
        status: "AVAILABLE",
        expiresAt: "2026-05-04T00:00:00.000Z",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { claimDailyPack } = await import("./pack-opening.service");
    const request: ClaimDailyPackRequestDto = {
      clientRequestId: "request-1",
    };

    const response = await claimDailyPack(request);

    expect(response.claimId).toBe("daily_user-1_2026-05-03");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8081/api/packs/claim-daily",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer id-token-1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }),
    );
  });

  it("claimDailyPack maps backend API errors", async () => {
    firebaseAuthMock.currentUser = {
      getIdToken: async () => "id-token-1",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          {
            error: {
              code: "PERMISSION_DENIED",
              message: "Forbidden",
            },
          },
          { status: 403 },
        ),
      ),
    );
    const { claimDailyPack } = await import("./pack-opening.service");

    await expect(claimDailyPack()).rejects.toMatchObject({
      code: "PERMISSION_DENIED",
      message: "Forbidden",
    });
  });

  it("openPack still uses Firebase Functions", async () => {
    const { openPack } = await import("./pack-opening.service");

    await openPack({
      source: "DAILY",
      claimId: "claim-1",
    });

    expect(openPackCallableMock).toHaveBeenCalledWith({
      source: "DAILY",
      claimId: "claim-1",
    });
  });
});
