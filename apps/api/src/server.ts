import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { claimDailyPackUseCase } from "@albumsl/application";
import {
  ApiErrorCode,
  type ApiErrorResponse,
  type AuthenticatedUserDto,
  type ClaimDailyPackRequestDto,
  type ClaimDailyPackResponseDto,
  type HealthResponseDto,
} from "@albumsl/contracts";

import { createApiDependencies } from "./api-dependencies.js";
import { authenticateUserFromAuthorizationHeader } from "./firebase-auth.js";
import { HttpApiError, toHttpApiError } from "./http-errors.js";

const MAX_JSON_BODY_BYTES = 16 * 1024;

export interface ApiServerOptions {
  readonly authenticateUser?: (
    authorizationHeader: string | undefined,
  ) => Promise<AuthenticatedUserDto>;
  readonly claimDailyPack?: (
    user: AuthenticatedUserDto,
    request: ClaimDailyPackRequestDto,
  ) => Promise<ClaimDailyPackResponseDto>;
}

function getRequestedPath(request: IncomingMessage): string {
  return new URL(request.url ?? "/", "http://localhost").pathname;
}

function sendJson(
  response: ServerResponse<IncomingMessage>,
  statusCode: number,
  payload: object,
): void {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body).toString(),
  });
  response.end(body);
}

function sendApiError(
  response: ServerResponse<IncomingMessage>,
  statusCode: number,
  payload: ApiErrorResponse,
): void {
  sendJson(response, statusCode, payload);
}

function sendInternalError(response: ServerResponse<IncomingMessage>): void {
  sendApiError(response, 500, {
    error: {
      code: ApiErrorCode.INTERNAL_ERROR,
      message: "Internal server error",
    },
  });
}

function sendNotFound(response: ServerResponse<IncomingMessage>): void {
  sendJson(response, 404, {
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
}

function sendHttpApiError(response: ServerResponse<IncomingMessage>, error: HttpApiError): void {
  sendApiError(response, error.statusCode, {
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  });
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;

    if (totalBytes > MAX_JSON_BODY_BYTES) {
      throw new HttpApiError(400, ApiErrorCode.INVALID_ARGUMENT, "Request body is too large");
    }

    chunks.push(buffer);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();
  if (rawBody.length === 0) {
    return {};
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new HttpApiError(400, ApiErrorCode.INVALID_ARGUMENT, "Request body must be valid JSON");
  }
}

function parseClaimDailyPackRequest(body: unknown): ClaimDailyPackRequestDto {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpApiError(400, ApiErrorCode.INVALID_ARGUMENT, "Request body must be an object");
  }

  const clientRequestId = (body as { readonly clientRequestId?: unknown }).clientRequestId;
  if (clientRequestId !== undefined && typeof clientRequestId !== "string") {
    throw new HttpApiError(400, ApiErrorCode.INVALID_ARGUMENT, "clientRequestId must be a string");
  }

  return {
    clientRequestId,
  };
}

async function defaultClaimDailyPack(
  user: AuthenticatedUserDto,
  request: ClaimDailyPackRequestDto,
): Promise<ClaimDailyPackResponseDto> {
  const dependencies = createApiDependencies();
  const claim = await claimDailyPackUseCase(
    {
      userId: user.uid,
      clientRequestId: request.clientRequestId,
    },
    {
      packClaimRepository: dependencies.packClaimRepository,
      clock: dependencies.clock,
    },
  );

  return {
    claimId: claim.id,
    source: claim.source,
    status: claim.status,
    expiresAt: claim.expiresAt?.toISOString(),
  };
}

export function createApiServer(options: ApiServerOptions = {}) {
  const authenticateUser = options.authenticateUser ?? authenticateUserFromAuthorizationHeader;
  const claimDailyPack = options.claimDailyPack ?? defaultClaimDailyPack;

  return createServer((request, response) => {
    void (async () => {
      const method = request.method ?? "GET";
      const path = getRequestedPath(request);

      if (method === "GET" && path === "/api/health") {
        const healthResponse: HealthResponseDto = {
          ok: true,
          service: "albumsl-api",
        };
        sendJson(response, 200, healthResponse);
        return;
      }

      if (method === "GET" && path === "/api/me") {
        try {
          const authenticatedUser = await authenticateUser(request.headers.authorization);
          sendJson(response, 200, authenticatedUser);
          return;
        } catch (error) {
          sendHttpApiError(response, toHttpApiError(error));
          return;
        }
      }

      if (method === "POST" && path === "/api/packs/claim-daily") {
        try {
          const authenticatedUser = await authenticateUser(request.headers.authorization);
          const body = await readJsonBody(request);
          const claimRequest = parseClaimDailyPackRequest(body);
          const claimResponse = await claimDailyPack(authenticatedUser, claimRequest);
          sendJson(response, 200, claimResponse);
          return;
        } catch (error) {
          sendHttpApiError(response, toHttpApiError(error));
          return;
        }
      }

      sendNotFound(response);
    })().catch(() => {
      sendInternalError(response);
    });
  });
}
