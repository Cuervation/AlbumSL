import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { claimDailyPackUseCase, openPackUseCase } from "@albumsl/application";
import {
  ApiErrorCode,
  type ApiErrorResponse,
  type AuthenticatedUserDto,
  type ClaimDailyPackRequestDto,
  type ClaimDailyPackResponseDto,
  type HealthResponseDto,
  type OpenPackRequestDto,
  type OpenPackResponseDto,
  type PackSourceDto,
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
  readonly openPack?: (
    user: AuthenticatedUserDto,
    request: OpenPackRequestDto,
  ) => Promise<OpenPackResponseDto>;
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

function toOpenPackHttpApiError(error: unknown): HttpApiError {
  const httpError = toHttpApiError(error);

  if (
    httpError.code === ApiErrorCode.INVALID_CLAIM ||
    httpError.code === ApiErrorCode.PERMISSION_DENIED
  ) {
    return new HttpApiError(
      404,
      ApiErrorCode.INVALID_CLAIM,
      "Pack claim is not available",
      httpError.details,
    );
  }

  return httpError;
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

function parseOpenPackRequest(body: unknown): OpenPackRequestDto {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpApiError(400, ApiErrorCode.INVALID_ARGUMENT, "Request body must be an object");
  }

  const source = (body as { readonly source?: unknown }).source;
  if (typeof source !== "string") {
    throw new HttpApiError(400, ApiErrorCode.INVALID_ARGUMENT, "source must be a string");
  }

  if (!PACK_SOURCES.includes(source as PackSourceDto)) {
    throw new HttpApiError(400, ApiErrorCode.INVALID_ARGUMENT, "Invalid pack source");
  }

  const claimId = (body as { readonly claimId?: unknown }).claimId;
  if (typeof claimId !== "string") {
    throw new HttpApiError(400, ApiErrorCode.INVALID_ARGUMENT, "claimId must be a string");
  }

  return {
    source: source as PackSourceDto,
    claimId,
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

async function defaultOpenPack(
  user: AuthenticatedUserDto,
  request: OpenPackRequestDto,
): Promise<OpenPackResponseDto> {
  const dependencies = createApiDependencies();
  const result = await openPackUseCase(
    {
      userId: user.uid,
      source: request.source,
      claimId: request.claimId,
    },
    {
      transactionRunner: dependencies.transactionRunner,
      clock: dependencies.clock,
      idGenerator: dependencies.idGenerator,
      randomGenerator: dependencies.randomGenerator,
    },
  );

  return {
    packOpeningId: result.packOpeningId,
    source: result.source,
    stickers: result.stickers.map((stickerResult) => ({
      stickerId: stickerResult.sticker.id,
      number: stickerResult.sticker.number,
      title: stickerResult.sticker.title,
      imageUrl: stickerResult.sticker.imageUrl,
      rarity: stickerResult.sticker.rarity,
      category: stickerResult.sticker.category,
      isNew: stickerResult.isNew,
      quantityAfter: stickerResult.quantityAfter,
    })),
    newCount: result.newCount,
    repeatedCount: result.repeatedCount,
    createdAt: result.createdAt.toISOString(),
  };
}

export function createApiServer(options: ApiServerOptions = {}) {
  const authenticateUser = options.authenticateUser ?? authenticateUserFromAuthorizationHeader;
  const claimDailyPack = options.claimDailyPack ?? defaultClaimDailyPack;
  const openPack = options.openPack ?? defaultOpenPack;

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

      if (method === "POST" && path === "/api/packs/open") {
        try {
          const authenticatedUser = await authenticateUser(request.headers.authorization);
          const body = await readJsonBody(request);
          const openRequest = parseOpenPackRequest(body);
          const openResponse = await openPack(authenticatedUser, openRequest);
          sendJson(response, 200, openResponse);
          return;
        } catch (error) {
          sendHttpApiError(response, toOpenPackHttpApiError(error));
          return;
        }
      }

      sendNotFound(response);
    })().catch(() => {
      sendInternalError(response);
    });
  });
}

const PACK_SOURCES: readonly PackSourceDto[] = ["DAILY", "STADIUM", "PROMO", "ADMIN"];
