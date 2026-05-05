import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { claimDailyPackUseCase, openPackUseCase, pasteStickerUseCase } from "@albumsl/application";
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
  type PasteStickerRequestDto,
  type PasteStickerResponseDto,
} from "@albumsl/contracts";

import { createApiDependencies } from "./api-dependencies.js";
import { authenticateUserFromAuthorizationHeader } from "./firebase-auth.js";
import { HttpApiError, toHttpApiError } from "./http-errors.js";
import { createRequestLogContext, logApiStage, withApiTimeout } from "./safe-log.js";

const MAX_JSON_BODY_BYTES = 16 * 1024;
const CORS_ALLOWED_METHODS = "GET, POST, OPTIONS";
const CORS_ALLOWED_HEADERS = "Authorization, Content-Type";

export interface ApiServerOptions {
  readonly allowedOrigins?: readonly string[];
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
  readonly pasteSticker?: (
    user: AuthenticatedUserDto,
    request: PasteStickerRequestDto,
  ) => Promise<PasteStickerResponseDto>;
}

function getRequestedPath(request: IncomingMessage): string {
  return new URL(request.url ?? "/", "http://localhost").pathname;
}

function parseAllowedOrigins(rawAllowedOrigins: string | undefined): readonly string[] {
  if (!rawAllowedOrigins) {
    return [];
  }

  return rawAllowedOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function getAllowedOrigin(
  request: IncomingMessage,
  allowedOrigins: readonly string[],
): string | undefined {
  const origin = request.headers.origin;
  if (!origin || Array.isArray(origin)) {
    return undefined;
  }

  return allowedOrigins.includes(origin) ? origin : undefined;
}

function writeCorsHeaders(response: ServerResponse<IncomingMessage>, origin: string): void {
  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Methods", CORS_ALLOWED_METHODS);
  response.setHeader("Access-Control-Allow-Headers", CORS_ALLOWED_HEADERS);
  response.setHeader("Vary", "Origin");
}

function sendCorsPreflight(
  response: ServerResponse<IncomingMessage>,
  allowedOrigin: string | undefined,
): void {
  if (allowedOrigin) {
    writeCorsHeaders(response, allowedOrigin);
  }

  response.writeHead(204);
  response.end();
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

function parsePasteStickerRequest(body: unknown): PasteStickerRequestDto {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpApiError(400, ApiErrorCode.INVALID_ARGUMENT, "Request body must be an object");
  }

  const stickerId = (body as { readonly stickerId?: unknown }).stickerId;
  if (typeof stickerId !== "string" || stickerId.trim().length === 0) {
    throw new HttpApiError(400, ApiErrorCode.INVALID_ARGUMENT, "Invalid sticker id");
  }

  return {
    stickerId: stickerId.trim(),
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
      era: stickerResult.sticker.era,
      rarity: stickerResult.sticker.rarity,
      category: stickerResult.sticker.category,
      tags: stickerResult.sticker.tags,
      isNew: stickerResult.isNew,
      quantityAfter: stickerResult.quantityAfter,
    })),
    newCount: result.newCount,
    repeatedCount: result.repeatedCount,
    createdAt: result.createdAt.toISOString(),
  };
}

async function defaultPasteSticker(
  user: AuthenticatedUserDto,
  request: PasteStickerRequestDto,
): Promise<PasteStickerResponseDto> {
  const dependencies = createApiDependencies();
  const result = await pasteStickerUseCase(
    {
      userId: user.uid,
      stickerId: request.stickerId,
    },
    {
      transactionRunner: dependencies.transactionRunner,
      clock: dependencies.clock,
    },
  );

  return {
    stickerId: result.userSticker.stickerId,
    quantity: result.userSticker.quantity,
    pastedQuantity: result.userSticker.pastedQuantity,
    repeatedQuantity: Math.max(result.userSticker.quantity - result.userSticker.pastedQuantity, 0),
    albumProgress: {
      totalStickers: result.albumProgress.totalStickers,
      collectedStickers: result.albumProgress.collectedStickers,
      pastedStickers: result.albumProgress.pastedStickers,
      repeatedStickers: result.albumProgress.repeatedStickers,
      completionPercentage: result.albumProgress.completionPercentage,
    },
  };
}

export function createApiServer(options: ApiServerOptions = {}) {
  const allowedOrigins =
    options.allowedOrigins ?? parseAllowedOrigins(process.env.ALBUMSL_ALLOWED_ORIGINS);
  const authenticateUser = options.authenticateUser ?? authenticateUserFromAuthorizationHeader;
  const claimDailyPack = options.claimDailyPack ?? defaultClaimDailyPack;
  const openPack = options.openPack ?? defaultOpenPack;
  const pasteSticker = options.pasteSticker ?? defaultPasteSticker;

  return createServer((request, response) => {
    void (async () => {
      const method = request.method ?? "GET";
      const path = getRequestedPath(request);
      const allowedOrigin = getAllowedOrigin(request, allowedOrigins);
      const logContext = createRequestLogContext(method, path);

      logApiStage(logContext, "request_start", {
        hasOrigin: Boolean(request.headers.origin),
      });

      if (allowedOrigin) {
        writeCorsHeaders(response, allowedOrigin);
      }

      if (method === "OPTIONS") {
        sendCorsPreflight(response, allowedOrigin);
        return;
      }

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
          logApiStage(logContext, "auth_start");
          const authenticatedUser = await withApiTimeout(
            logContext,
            "auth",
            authenticateUser(request.headers.authorization),
          );
          logApiStage(logContext, "auth_ok");
          sendJson(response, 200, authenticatedUser);
          logApiStage(logContext, "request_ok", { statusCode: 200 });
          return;
        } catch (error) {
          const httpError = toHttpApiError(error);
          logApiStage(logContext, "request_error", { statusCode: httpError.statusCode });
          sendHttpApiError(response, httpError);
          return;
        }
      }

      if (method === "POST" && path === "/api/packs/claim-daily") {
        try {
          logApiStage(logContext, "auth_start");
          const authenticatedUser = await withApiTimeout(
            logContext,
            "auth",
            authenticateUser(request.headers.authorization),
          );
          logApiStage(logContext, "auth_ok");
          logApiStage(logContext, "body_start");
          const body = await withApiTimeout(logContext, "body", readJsonBody(request));
          logApiStage(logContext, "body_ok");
          const claimRequest = parseClaimDailyPackRequest(body);
          logApiStage(logContext, "claim_daily_start");
          const claimResponse = await withApiTimeout(
            logContext,
            "claim_daily",
            claimDailyPack(authenticatedUser, claimRequest),
          );
          logApiStage(logContext, "claim_daily_ok", { claimStatus: claimResponse.status });
          sendJson(response, 200, claimResponse);
          logApiStage(logContext, "request_ok", { statusCode: 200 });
          return;
        } catch (error) {
          const httpError = toHttpApiError(error);
          logApiStage(logContext, "request_error", { statusCode: httpError.statusCode });
          sendHttpApiError(response, httpError);
          return;
        }
      }

      if (method === "POST" && path === "/api/packs/open") {
        try {
          logApiStage(logContext, "auth_start");
          const authenticatedUser = await withApiTimeout(
            logContext,
            "auth",
            authenticateUser(request.headers.authorization),
          );
          logApiStage(logContext, "auth_ok");
          logApiStage(logContext, "body_start");
          const body = await withApiTimeout(logContext, "body", readJsonBody(request));
          logApiStage(logContext, "body_ok");
          const openRequest = parseOpenPackRequest(body);
          logApiStage(logContext, "open_pack_start");
          const openResponse = await withApiTimeout(
            logContext,
            "open_pack",
            openPack(authenticatedUser, openRequest),
          );
          logApiStage(logContext, "open_pack_ok");
          sendJson(response, 200, openResponse);
          logApiStage(logContext, "request_ok", { statusCode: 200 });
          return;
        } catch (error) {
          const httpError = toOpenPackHttpApiError(error);
          logApiStage(logContext, "request_error", { statusCode: httpError.statusCode });
          sendHttpApiError(response, httpError);
          return;
        }
      }

      if (method === "POST" && path === "/api/stickers/paste") {
        try {
          logApiStage(logContext, "auth_start");
          const authenticatedUser = await withApiTimeout(
            logContext,
            "auth",
            authenticateUser(request.headers.authorization),
          );
          logApiStage(logContext, "auth_ok");
          logApiStage(logContext, "body_start");
          const body = await withApiTimeout(logContext, "body", readJsonBody(request));
          logApiStage(logContext, "body_ok");
          const pasteRequest = parsePasteStickerRequest(body);
          logApiStage(logContext, "paste_sticker_start");
          const pasteResponse = await withApiTimeout(
            logContext,
            "paste_sticker",
            pasteSticker(authenticatedUser, pasteRequest),
          );
          logApiStage(logContext, "paste_sticker_ok");
          sendJson(response, 200, pasteResponse);
          logApiStage(logContext, "request_ok", { statusCode: 200 });
          return;
        } catch (error) {
          const httpError = toHttpApiError(error);
          logApiStage(logContext, "request_error", { statusCode: httpError.statusCode });
          sendHttpApiError(response, httpError);
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
