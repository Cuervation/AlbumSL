import type {
  AdminDashboardRequestDto,
  AdminDashboardResponseDto,
  ClaimDailyPackRequestDto,
  ClaimDailyPackResponseDto,
  OpenPackRequestDto,
  OpenPackResponseDto,
  PackSourceDto,
  PasteStickerRequestDto,
  PasteStickerResponseDto,
} from "@albumsl/contracts";
import {
  claimDailyPackUseCase,
  createApplicationContext,
  openPackUseCase,
  pasteStickerUseCase,
} from "@albumsl/application";
import { createFirebaseInfrastructure } from "@albumsl/infra-firebase";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";

import { createFunctionDependencies } from "./function-dependencies.js";
import { getAdminDashboard } from "./admin-dashboard.js";
import { toHttpsError } from "./https-errors.js";
import { logError, logInfo, logWarning } from "./logger.js";

const infrastructure = createFirebaseInfrastructure();
const application = createApplicationContext({ infrastructure });

export const health = onRequest((_request, response) => {
  response.status(200).json({
    ok: true,
    service: application.serviceName,
  });
});

export const claimDailyPack = onCall<ClaimDailyPackRequestDto>(
  async (request): Promise<ClaimDailyPackResponseDto> => {
    const functionName = "claimDailyPack";
    const userId = request.auth?.uid;
    logInfo("function_start", { functionName, userId, source: "DAILY" });

    try {
      const authenticatedUserId = getAuthenticatedUserId(userId);
      const dependencies = createFunctionDependencies();
      const claim = await claimDailyPackUseCase(
        {
          userId: authenticatedUserId,
          clientRequestId: request.data?.clientRequestId,
        },
        {
          packClaimRepository: dependencies.packClaimRepository,
          clock: dependencies.clock,
        },
      );

      logInfo("function_success", {
        functionName,
        userId: authenticatedUserId,
        source: claim.source,
        claimId: claim.id,
      });

      return {
        claimId: claim.id,
        source: claim.source,
        status: claim.status,
        expiresAt: claim.expiresAt?.toISOString(),
      };
    } catch (error) {
      const httpsError = toHttpsError(error);
      logControlledError(functionName, httpsError.details, { userId, source: "DAILY" });
      throw httpsError;
    }
  },
);

export const openPack = onCall<OpenPackRequestDto>(
  async (request): Promise<OpenPackResponseDto> => {
    const functionName = "openPack";
    const userId = request.auth?.uid;
    const rawSource = typeof request.data?.source === "string" ? request.data.source : undefined;
    const rawClaimId = typeof request.data?.claimId === "string" ? request.data.claimId : undefined;
    logInfo("function_start", {
      functionName,
      userId,
      source: rawSource,
      claimId: rawClaimId,
    });

    try {
      const authenticatedUserId = getAuthenticatedUserId(userId);
      const data = request.data;
      const source = parsePackSource(data?.source);
      const claimId = typeof data?.claimId === "string" ? data.claimId : "";

      const dependencies = createFunctionDependencies();
      const result = await openPackUseCase(
        {
          userId: authenticatedUserId,
          source,
          claimId,
        },
        {
          transactionRunner: dependencies.transactionRunner,
          clock: dependencies.clock,
          idGenerator: dependencies.idGenerator,
          randomGenerator: dependencies.randomGenerator,
        },
      );

      logInfo("function_success", {
        functionName,
        userId: authenticatedUserId,
        source: result.source,
        claimId,
        packOpeningId: result.packOpeningId,
      });

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
    } catch (error) {
      const httpsError = toHttpsError(error);
      logControlledError(functionName, httpsError.details, {
        userId,
        source: rawSource,
        claimId: rawClaimId,
      });
      throw httpsError;
    }
  },
);

export const pasteSticker = onCall<PasteStickerRequestDto>(
  async (request): Promise<PasteStickerResponseDto> => {
    const functionName = "pasteSticker";
    const userId = request.auth?.uid;
    const rawStickerId =
      typeof request.data?.stickerId === "string" ? request.data.stickerId : undefined;
    logInfo("function_start", { functionName, userId, stickerId: rawStickerId });

    try {
      const authenticatedUserId = getAuthenticatedUserId(userId);
      const stickerId = parseStickerId(request.data?.stickerId);
      const dependencies = createFunctionDependencies();
      const result = await pasteStickerUseCase(
        {
          userId: authenticatedUserId,
          stickerId,
        },
        {
          transactionRunner: dependencies.transactionRunner,
          clock: dependencies.clock,
        },
      );

      logInfo("function_success", {
        functionName,
        userId: authenticatedUserId,
        stickerId,
      });

      return {
        stickerId: result.userSticker.stickerId,
        quantity: result.userSticker.quantity,
        pastedQuantity: result.userSticker.pastedQuantity,
        repeatedQuantity: Math.max(
          result.userSticker.quantity - result.userSticker.pastedQuantity,
          0,
        ),
        albumProgress: {
          totalStickers: result.albumProgress.totalStickers,
          collectedStickers: result.albumProgress.collectedStickers,
          pastedStickers: result.albumProgress.pastedStickers,
          repeatedStickers: result.albumProgress.repeatedStickers,
          completionPercentage: result.albumProgress.completionPercentage,
        },
      };
    } catch (error) {
      const httpsError = toHttpsError(error);
      logControlledError(functionName, httpsError.details, {
        userId,
        stickerId: rawStickerId,
      });
      throw httpsError;
    }
  },
);

export const adminGetDashboard = onCall<AdminDashboardRequestDto>(
  async (request): Promise<AdminDashboardResponseDto> => {
    const functionName = "adminGetDashboard";
    const userId = request.auth?.uid;
    const admin = request.auth?.token.admin === true;
    logInfo("function_start", { functionName, userId, admin });

    try {
      const dependencies = createFunctionDependencies();

      const result = await getAdminDashboard(
        request.auth
          ? {
              uid: request.auth.uid,
              token: {
                admin: request.auth.token.admin,
              },
            }
          : undefined,
        dependencies.adminDashboardDataSource,
      );

      logInfo("function_success", { functionName, userId: request.auth?.uid, admin });

      return result;
    } catch (error) {
      const httpsError = toHttpsError(error);
      logControlledError(functionName, httpsError.details, { userId, admin });
      throw httpsError;
    }
  },
);

const PACK_SOURCES: readonly PackSourceDto[] = ["DAILY", "STADIUM", "PROMO", "ADMIN"];

function getAuthenticatedUserId(userId: string | undefined): string {
  if (!userId) {
    throw new HttpsError("unauthenticated", "Authentication is required", {
      code: "UNAUTHENTICATED",
    });
  }

  return userId;
}

function parsePackSource(source: unknown): PackSourceDto {
  if (typeof source !== "string" || !PACK_SOURCES.includes(source as PackSourceDto)) {
    throw new HttpsError("invalid-argument", "Invalid pack source", {
      code: "INVALID_ARGUMENT",
    });
  }

  return source as PackSourceDto;
}

function parseStickerId(stickerId: unknown): string {
  if (typeof stickerId !== "string" || stickerId.trim().length === 0) {
    throw new HttpsError("invalid-argument", "Invalid sticker id", {
      code: "INVALID_ARGUMENT",
    });
  }

  return stickerId.trim();
}

function logControlledError(
  functionName: string,
  details: unknown,
  metadata: {
    readonly userId?: string;
    readonly source?: string;
    readonly claimId?: string;
    readonly stickerId?: string;
    readonly admin?: boolean;
  },
): void {
  const errorCode = getErrorCode(details);
  const logMetadata = {
    functionName,
    userId: metadata.userId,
    source: metadata.source,
    claimId: metadata.claimId,
    stickerId: metadata.stickerId,
    errorCode,
    admin: metadata.admin,
  };

  if (errorCode === "INTERNAL_ERROR") {
    logError("function_error", logMetadata);
    return;
  }

  logWarning("function_error", logMetadata);
}

function getErrorCode(details: unknown): string {
  if (details && typeof details === "object" && "code" in details) {
    const code = (details as { readonly code?: unknown }).code;
    return typeof code === "string" ? code : "INTERNAL_ERROR";
  }

  return "INTERNAL_ERROR";
}
