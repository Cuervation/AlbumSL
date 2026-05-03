import { request } from "node:http";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

import { describe, expect, it } from "vitest";

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
    readonly body?: object;
  } = {},
): Promise<TestResponse> {
  const body = options.body ? JSON.stringify(options.body) : "";

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
});
