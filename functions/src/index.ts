import type {
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
import { toHttpsError } from "./https-errors.js";

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
    try {
      const userId = getAuthenticatedUserId(request.auth?.uid);
      const dependencies = createFunctionDependencies();
      const claim = await claimDailyPackUseCase(
        {
          userId,
          clientRequestId: request.data?.clientRequestId,
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
    } catch (error) {
      throw toHttpsError(error);
    }
  },
);

export const openPack = onCall<OpenPackRequestDto>(
  async (request): Promise<OpenPackResponseDto> => {
    try {
      const userId = getAuthenticatedUserId(request.auth?.uid);
      const data = request.data;
      const source = parsePackSource(data?.source);
      const claimId = typeof data?.claimId === "string" ? data.claimId : "";

      const dependencies = createFunctionDependencies();
      const result = await openPackUseCase(
        {
          userId,
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
      throw toHttpsError(error);
    }
  },
);

export const pasteSticker = onCall<PasteStickerRequestDto>(
  async (request): Promise<PasteStickerResponseDto> => {
    try {
      const userId = getAuthenticatedUserId(request.auth?.uid);
      const stickerId = parseStickerId(request.data?.stickerId);
      const dependencies = createFunctionDependencies();
      const result = await pasteStickerUseCase(
        {
          userId,
          stickerId,
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
      throw toHttpsError(error);
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
