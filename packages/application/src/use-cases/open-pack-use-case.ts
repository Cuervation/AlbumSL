import {
  calculateAlbumProgress,
  calculatePackResult,
  calculateUpdatedUserStickers,
  ClaimStatus,
  DEFAULT_PACK_CONFIG,
  DomainValidationError,
  PackSource,
  pickPackStickers,
  type PackConfig,
  type PackOpenResult,
  type PackOpening,
  type UserAlbumSummary,
  type UserSticker,
} from "@albumsl/domain";

import { ApplicationError } from "../errors.js";
import type { Clock, IdGenerator, RandomGenerator, TransactionRunner } from "../ports.js";

export interface OpenPackInput {
  readonly userId: string;
  readonly source: PackSource;
  readonly claimId: string;
}

export interface OpenPackDependencies {
  readonly transactionRunner: TransactionRunner;
  readonly clock: Clock;
  readonly idGenerator: IdGenerator;
  readonly randomGenerator: RandomGenerator;
  readonly packConfig?: PackConfig;
}

export async function openPackUseCase(
  input: OpenPackInput,
  dependencies: OpenPackDependencies,
): Promise<PackOpenResult> {
  const userId = input.userId.trim();
  const claimId = input.claimId.trim();

  if (userId.length === 0 || claimId.length === 0) {
    throw new ApplicationError("INVALID_ARGUMENT", "userId and claimId are required");
  }

  if (!Object.values(PackSource).includes(input.source)) {
    throw new ApplicationError("INVALID_ARGUMENT", "Invalid pack source");
  }

  const packConfig = dependencies.packConfig ?? DEFAULT_PACK_CONFIG;

  return dependencies.transactionRunner.run(async (repositories) => {
    const now = dependencies.clock.now();
    const claim = await repositories.packClaimRepository.findById(claimId);

    if (!claim) {
      throw new ApplicationError("INVALID_CLAIM", "Pack claim was not found");
    }

    if (claim.userId !== userId) {
      throw new ApplicationError("PERMISSION_DENIED", "Pack claim does not belong to user");
    }

    if (claim.source !== input.source) {
      throw new ApplicationError("INVALID_CLAIM", "Pack claim source does not match request");
    }

    if (claim.status === ClaimStatus.CONSUMED) {
      throw new ApplicationError("CLAIM_ALREADY_CONSUMED", "Pack claim was already consumed");
    }

    if (claim.status === ClaimStatus.EXPIRED || isExpired(claim.expiresAt, now)) {
      throw new ApplicationError("CLAIM_EXPIRED", "Pack claim is expired");
    }

    if (claim.status !== ClaimStatus.AVAILABLE) {
      throw new ApplicationError("INVALID_CLAIM", "Pack claim is not available");
    }

    const activeStickers = await repositories.stickerCatalogRepository.getActiveStickers();

    if (activeStickers.length === 0) {
      throw new ApplicationError("NO_ACTIVE_STICKERS", "No active stickers available");
    }

    const previousUserStickers = await repositories.userStickerRepository.findByUserId(userId);
    const pickedStickers = pickPackStickersSafely(
      activeStickers,
      packConfig,
      dependencies.randomGenerator,
    );
    const existingSummary = await repositories.userAlbumRepository.findByUserId(userId);
    const packResult = calculatePackResult(previousUserStickers, pickedStickers);
    const updatedUserStickers = stampUserStickerDates(
      calculateUpdatedUserStickers(previousUserStickers, pickedStickers),
      previousUserStickers,
      now,
    );
    const packOpeningId = dependencies.idGenerator.nextId("opening");
    const auditLogId = dependencies.idGenerator.nextId("audit");

    await repositories.userStickerRepository.saveMany(userId, updatedUserStickers);

    const packOpening: PackOpening = {
      id: packOpeningId,
      userId,
      source: input.source,
      claimId,
      stickerIds: pickedStickers.map((pickedSticker) => pickedSticker.stickerId),
      newCount: packResult.newCount,
      repeatedCount: packResult.repeatedCount,
      createdAt: now,
      metadata: {
        packSize: packConfig.packSize,
      },
      auditLogId,
    };

    await repositories.packOpeningRepository.save(packOpening);
    await repositories.packClaimRepository.save({
      ...claim,
      status: ClaimStatus.CONSUMED,
      consumedAt: now,
      updatedAt: now,
      packId: packOpeningId,
    });

    const progress = calculateAlbumProgress(updatedUserStickers, activeStickers.length);
    await repositories.userAlbumRepository.save({
      userId,
      totalStickers: progress.totalStickers,
      collectedCount: progress.collectedStickers,
      pastedCount: progress.pastedStickers,
      repeatedCount: progress.repeatedStickers,
      completionPercentage: progress.completionPercentage,
      createdAt: existingSummary?.createdAt ?? now,
      updatedAt: now,
    } satisfies UserAlbumSummary);

    await repositories.auditLogRepository.record({
      id: auditLogId,
      actorUserId: userId,
      action: "PACK_OPENED",
      entityType: "packOpening",
      entityId: packOpeningId,
      createdAt: now,
      severity: "INFO",
      metadata: {
        source: input.source,
        claimId,
        newCount: packResult.newCount,
        repeatedCount: packResult.repeatedCount,
      },
    });

    return {
      packOpeningId,
      source: input.source,
      claimId,
      stickers: packResult.stickers,
      newCount: packResult.newCount,
      repeatedCount: packResult.repeatedCount,
      createdAt: now,
    };
  });
}

function pickPackStickersSafely(
  activeStickers: Parameters<typeof pickPackStickers>[0],
  packConfig: PackConfig,
  randomGenerator: RandomGenerator,
): ReturnType<typeof pickPackStickers> {
  try {
    return pickPackStickers(activeStickers, packConfig, randomGenerator);
  } catch (error) {
    if (error instanceof DomainValidationError) {
      throw new ApplicationError("INVALID_ARGUMENT", error.message, error.issues);
    }

    throw error;
  }
}

function stampUserStickerDates(
  updatedUserStickers: readonly UserSticker[],
  previousUserStickers: readonly UserSticker[],
  now: Date,
): readonly UserSticker[] {
  const previousUserStickersById = new Map(
    previousUserStickers.map((userSticker) => [userSticker.stickerId, userSticker]),
  );

  return updatedUserStickers.map((userSticker) => {
    const previousUserSticker = previousUserStickersById.get(userSticker.stickerId);

    return {
      ...userSticker,
      firstCollectedAt:
        previousUserSticker?.firstCollectedAt ?? previousUserSticker?.acquiredAt ?? now,
      lastCollectedAt: now,
      updatedAt: now,
    };
  });
}

function isExpired(expiresAt: Date | undefined, now: Date): boolean {
  return expiresAt !== undefined && expiresAt.getTime() <= now.getTime();
}
