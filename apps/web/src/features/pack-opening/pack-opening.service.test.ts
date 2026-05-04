import type { ClaimDailyPackRequestDto, OpenPackRequestDto } from "@albumsl/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";

const firebaseAuthMock = vi.hoisted(() => ({
  currentUser: null as null | { readonly getIdToken: () => Promise<string> },
}));

vi.mock("../../lib/firebase", () => ({
  firebaseAuth: firebaseAuthMock,
  firebaseFunctions: {},
}));

describe("pack-opening.service", () => {
  beforeEach(() => {
    firebaseAuthMock.currentUser = null;
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

  it("openPack fails without an authenticated user", async () => {
    const { openPack } = await import("./pack-opening.service");
    const request: OpenPackRequestDto = {
      source: "DAILY",
      claimId: "claim-1",
    };

    await expect(openPack(request)).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
  });

  it("openPack sends the Firebase ID token to the backend", async () => {
    firebaseAuthMock.currentUser = {
      getIdToken: async () => "id-token-1",
    };
    const fetchMock = vi.fn(async () =>
      Response.json({
        packOpeningId: "opening-1",
        source: "DAILY",
        stickers: [],
        newCount: 0,
        repeatedCount: 0,
        createdAt: "2026-05-03T00:00:00.000Z",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { openPack } = await import("./pack-opening.service");
    const request: OpenPackRequestDto = {
      source: "DAILY",
      claimId: "claim-1",
    };

    const response = await openPack(request);

    expect(response.packOpeningId).toBe("opening-1");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8081/api/packs/open",
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

  it("openPack maps backend API errors", async () => {
    firebaseAuthMock.currentUser = {
      getIdToken: async () => "id-token-1",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          {
            error: {
              code: "INVALID_CLAIM",
              message: "Pack claim is not available",
            },
          },
          { status: 404 },
        ),
      ),
    );
    const { openPack } = await import("./pack-opening.service");

    await expect(
      openPack({
        source: "DAILY",
        claimId: "claim-1",
      }),
    ).rejects.toMatchObject({
      code: "INVALID_CLAIM",
      message: "Pack claim is not available",
    });
  });
});
