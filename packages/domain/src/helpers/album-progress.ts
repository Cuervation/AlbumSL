import type { AlbumProgress, UserSticker } from "../entities.js";
import { getRepeatedQuantity, isStickerCollected, isStickerPasted } from "./user-stickers.js";

export function countCollectedStickers(userStickers: readonly UserSticker[]): number {
  return userStickers.filter(isStickerCollected).length;
}

export function countPastedStickers(userStickers: readonly UserSticker[]): number {
  return userStickers.filter(isStickerPasted).length;
}

export function countRepeatedStickers(userStickers: readonly UserSticker[]): number {
  return userStickers.reduce((total, userSticker) => total + getRepeatedQuantity(userSticker), 0);
}

export function calculateAlbumProgress(
  userStickers: readonly UserSticker[],
  totalStickers: number,
): AlbumProgress {
  const safeTotalStickers = Math.max(totalStickers, 0);
  const pastedStickers = countPastedStickers(userStickers);
  const completionPercentage =
    safeTotalStickers === 0 ? 0 : Number(((pastedStickers / safeTotalStickers) * 100).toFixed(2));

  return {
    totalStickers: safeTotalStickers,
    collectedStickers: countCollectedStickers(userStickers),
    pastedStickers,
    repeatedStickers: countRepeatedStickers(userStickers),
    completionPercentage,
  };
}
