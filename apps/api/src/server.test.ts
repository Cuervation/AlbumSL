import { request } from "node:http";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

import { ApplicationError } from "@albumsl/application";
import { ApiErrorCode } from "@albumsl/contracts";
import { describe, expect, it } from "vitest";

import { HttpApiError } from "./http-errors.js";
import { createApiServer, type ApiServerOptions } from "./server.js";

interface TestResponse {
  readonly statusCode: number;
  readonly body: unknown;
}

async function withServer<T>(
  options: ApiServerOptions,
  test: (baseUrl: string) => Promise<T>,
): Promise<T> {
  const server = createApiServer(options);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address() as AddressInfo;
    return await test(`http://127.0.0.1:${address.port}`);
  } finally {
    await closeServer(server);
  }
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function postJson(
  url: string,
  options: {
    readonly authorization?: string;
    readonly body?: unknown;
  } = {},
): Promise<TestResponse> {
  const body = options.body === undefined ? "" : JSON.stringify(options.body);

  return new Promise((resolve, reject) => {
    const clientRequest = request(
      url,
      {
        method: "POST",
        headers: {
          ...(options.authorization ? { Authorization: options.authorization } : {}),
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body).toString(),
        },
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => {
          const rawBody = Buffer.concat(chunks).toString("utf8");
          resolve({
            statusCode: response.statusCode ?? 0,
            body: JSON.parse(rawBody) as unknown,
          });
        });
      },
    );

    clientRequest.on("error", reject);
    clientRequest.end(body);
  });
}

describe("createApiServer claim daily pack", () => {
  it("requires authentication", async () => {
    await withServer({}, async (baseUrl) => {
      const response = await postJson(`${baseUrl}/api/packs/claim-daily`);

      expect(response).toEqual({
        statusCode: 401,
        body: {
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication token is required",
          },
        },
      });
    });
  });

  it("claims a daily pack for the authenticated token user", async () => {
    await withServer(
      {
        authenticateUser: async (authorizationHeader) => {
          expect(authorizationHeader).toBe("Bearer valid-token");
          return {
            uid: "user-1",
            displayName: "User One",
            email: "user@example.com",
            photoURL: null,
          };
        },
        claimDailyPack: async (user, claimRequest) => {
          expect(user.uid).toBe("user-1");
          expect(claimRequest.clientRequestId).toBe("request-1");

          return {
            claimId: "daily_user-1_2026-05-03",
            source: "DAILY",
            status: "AVAILABLE",
            expiresAt: "2026-05-04T00:00:00.000Z",
          };
        },
      },
      async (baseUrl) => {
        const response = await postJson(`${baseUrl}/api/packs/claim-daily`, {
          authorization: "Bearer valid-token",
          body: {
            clientRequestId: "request-1",
            uid: "attacker-controlled",
          },
        });

        expect(response).toEqual({
          statusCode: 200,
          body: {
            claimId: "daily_user-1_2026-05-03",
            source: "DAILY",
            status: "AVAILABLE",
            expiresAt: "2026-05-04T00:00:00.000Z",
          },
        });
      },
    );
  });

  it("rejects invalid clientRequestId shape", async () => {
    await withServer(
      {
        authenticateUser: async () => ({
          uid: "user-1",
          displayName: null,
          email: null,
          photoURL: null,
        }),
      },
      async (baseUrl) => {
        const response = await postJson(`${baseUrl}/api/packs/claim-daily`, {
          authorization: "Bearer valid-token",
          body: {
            clientRequestId: 123,
          },
        });

        expect(response).toEqual({
          statusCode: 400,
          body: {
            error: {
              code: "INVALID_ARGUMENT",
              message: "clientRequestId must be a string",
            },
          },
        });
      },
    );
  });

  it("rejects non-object request bodies", async () => {
    await withServer(
      {
        authenticateUser: async () => ({
          uid: "user-1",
          displayName: null,
          email: null,
          photoURL: null,
        }),
      },
      async (baseUrl) => {
        const response = await postJson(`${baseUrl}/api/packs/claim-daily`, {
          authorization: "Bearer valid-token",
          body: null,
        });

        expect(response).toEqual({
          statusCode: 400,
          body: {
            error: {
              code: "INVALID_ARGUMENT",
              message: "Request body must be an object",
            },
          },
        });
      },
    );
  });
});

describe("createApiServer open pack", () => {
  it("requires authentication", async () => {
    await withServer({}, async (baseUrl) => {
      const response = await postJson(`${baseUrl}/api/packs/open`, {
        body: {
          source: "DAILY",
          claimId: "claim-1",
        },
      });

      expect(response).toEqual({
        statusCode: 401,
        body: {
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication token is required",
          },
        },
      });
    });
  });

  it("rejects invalid tokens", async () => {
    await withServer(
      {
        authenticateUser: async () => {
          throw new HttpApiError(401, ApiErrorCode.UNAUTHENTICATED, "Invalid or expired token");
        },
      },
      async (baseUrl) => {
        const response = await postJson(`${baseUrl}/api/packs/open`, {
          authorization: "Bearer invalid-token",
          body: {
            source: "DAILY",
            claimId: "claim-1",
          },
        });

        expect(response).toEqual({
          statusCode: 401,
          body: {
            error: {
              code: "UNAUTHENTICATED",
              message: "Invalid or expired token",
            },
          },
        });
      },
    );
  });

  it("rejects invalid body shape", async () => {
    await withServer(
      {
        authenticateUser: async () => ({
          uid: "user-1",
          displayName: null,
          email: null,
          photoURL: null,
        }),
      },
      async (baseUrl) => {
        const response = await postJson(`${baseUrl}/api/packs/open`, {
          authorization: "Bearer valid-token",
          body: {
            source: 123,
            claimId: "claim-1",
          },
        });

        expect(response).toEqual({
          statusCode: 400,
          body: {
            error: {
              code: "INVALID_ARGUMENT",
              message: "source must be a string",
            },
          },
        });
      },
    );
  });

  it("rejects non-object request bodies", async () => {
    await withServer(
      {
        authenticateUser: async () => ({
          uid: "user-1",
          displayName: null,
          email: null,
          photoURL: null,
        }),
      },
      async (baseUrl) => {
        const response = await postJson(`${baseUrl}/api/packs/open`, {
          authorization: "Bearer valid-token",
          body: null,
        });

        expect(response).toEqual({
          statusCode: 400,
          body: {
            error: {
              code: "INVALID_ARGUMENT",
              message: "Request body must be an object",
            },
          },
        });
      },
    );
  });

  it("uses the authenticated uid and returns the open pack response", async () => {
    await withServer(
      {
        authenticateUser: async (authorizationHeader) => {
          expect(authorizationHeader).toBe("Bearer valid-token");
          return {
            uid: "user-1",
            displayName: "User One",
            email: "user@example.com",
            photoURL: null,
          };
        },
        openPack: async (user, openRequest) => {
          expect(user.uid).toBe("user-1");
          expect(openRequest).toEqual({
            source: "DAILY",
            claimId: "claim-1",
          });

          return {
            packOpeningId: "opening-1",
            source: "DAILY",
            stickers: [
              {
                stickerId: "sticker-1",
                number: 1,
                title: "Sticker 1",
                imageUrl: "https://example.com/sticker-1.png",
                rarity: "COMMON",
                category: "PLAYER",
                isNew: true,
                quantityAfter: 1,
              },
            ],
            newCount: 1,
            repeatedCount: 0,
            createdAt: "2026-05-03T00:00:00.000Z",
          };
        },
      },
      async (baseUrl) => {
        const response = await postJson(`${baseUrl}/api/packs/open`, {
          authorization: "Bearer valid-token",
          body: {
            source: "DAILY",
            claimId: "claim-1",
            uid: "attacker-controlled",
          },
        });

        expect(response).toEqual({
          statusCode: 200,
          body: {
            packOpeningId: "opening-1",
            source: "DAILY",
            stickers: [
              {
                stickerId: "sticker-1",
                number: 1,
                title: "Sticker 1",
                imageUrl: "https://example.com/sticker-1.png",
                rarity: "COMMON",
                category: "PLAYER",
                isNew: true,
                quantityAfter: 1,
              },
            ],
            newCount: 1,
            repeatedCount: 0,
            createdAt: "2026-05-03T00:00:00.000Z",
          },
        });
      },
    );
  });

  it("does not reveal claim ownership details", async () => {
    await withServer(
      {
        authenticateUser: async () => ({
          uid: "user-1",
          displayName: null,
          email: null,
          photoURL: null,
        }),
        openPack: async () => {
          throw new ApplicationError("PERMISSION_DENIED", "Pack claim does not belong to user");
        },
      },
      async (baseUrl) => {
        const response = await postJson(`${baseUrl}/api/packs/open`, {
          authorization: "Bearer valid-token",
          body: {
            source: "DAILY",
            claimId: "claim-1",
          },
        });

        expect(response).toEqual({
          statusCode: 404,
          body: {
            error: {
              code: "INVALID_CLAIM",
              details: [],
              message: "Pack claim is not available",
            },
          },
        });
      },
    );
  });
});
