import {
  canPasteSticker,
  calculateAlbumProgress,
  pasteSticker,
  type AlbumProgress,
  type StickerId,
  type UserSticker,
  validateUserSticker,
} from "@albumsl/domain";

import { ApplicationError } from "../errors.js";
import type { Clock, TransactionRunner } from "../ports.js";

export interface PasteStickerInput {
  readonly userId: string;
  readonly stickerId: StickerId;
}

export interface PasteStickerDependencies {
  readonly transactionRunner: TransactionRunner;
  readonly clock: Clock;
}

export interface PasteStickerResult {
  readonly userSticker: UserSticker;
  readonly albumProgress: AlbumProgress;
}

export async function pasteStickerUseCase(
  input: PasteStickerInput,
  dependencies: PasteStickerDependencies,
): Promise<PasteStickerResult> {
  const userId = input.userId.trim();
  const stickerId = input.stickerId.trim();

  if (userId.length === 0 || stickerId.length === 0) {
    throw new ApplicationError("INVALID_ARGUMENT", "userId and stickerId are required");
  }

  return dependencies.transactionRunner.run(async (repositories) => {
    const now = dependencies.clock.now();
    const userSticker = await repositories.userStickerRepository.findByUserIdAndStickerId(
      userId,
      stickerId,
    );

    if (!userSticker) {
      throw new ApplicationError(
        "INSUFFICIENT_QUANTITY",
        "User does not have this sticker available to paste",
      );
    }

    const validation = validateUserSticker(userSticker);

    if (!validation.isValid) {
      throw new ApplicationError("INVALID_ARGUMENT", "User sticker is invalid", validation.errors);
    }

    if (!canPasteSticker(userSticker)) {
      throw new ApplicationError(
        "INSUFFICIENT_QUANTITY",
        "User does not have an available sticker to paste",
      );
    }

    const [userStickers, totalStickers, existingSummary] = await Promise.all([
      repositories.userStickerRepository.findByUserId(userId),
      repositories.stickerCatalogRepository.count(),
      repositories.userAlbumRepository.findByUserId(userId),
    ]);
    const updatedUserSticker = {
      ...pasteSticker(userSticker),
      updatedAt: now,
    };
    const updatedUserStickers = replaceUserSticker(userStickers, updatedUserSticker);
    const albumProgress = calculateAlbumProgress(updatedUserStickers, totalStickers);

    await repositories.userStickerRepository.save(userId, updatedUserSticker);
    await repositories.userAlbumRepository.save({
      userId,
      totalStickers: albumProgress.totalStickers,
      collectedCount: albumProgress.collectedStickers,
      pastedCount: albumProgress.pastedStickers,
      repeatedCount: albumProgress.repeatedStickers,
      completionPercentage: albumProgress.completionPercentage,
      createdAt: existingSummary?.createdAt ?? now,
      updatedAt: now,
    });

    return {
      userSticker: updatedUserSticker,
      albumProgress,
    };
  });
}

function replaceUserSticker(
  userStickers: readonly UserSticker[],
  updatedUserSticker: UserSticker,
): readonly UserSticker[] {
  const userStickersById = new Map(
    userStickers.map((userSticker) => [userSticker.stickerId, userSticker]),
  );
  userStickersById.set(updatedUserSticker.stickerId, updatedUserSticker);

  return [...userStickersById.values()];
}
