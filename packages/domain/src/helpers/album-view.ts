import type { Sticker, UserSticker } from "../entities.js";
import { getRepeatedQuantity, isStickerCollected, isStickerPasted } from "./user-stickers.js";

export const AlbumStickerStatus = {
  MISSING: "MISSING",
  COLLECTED: "COLLECTED",
  PASTED: "PASTED",
  REPEATED: "REPEATED",
} as const;

export type AlbumStickerStatus = (typeof AlbumStickerStatus)[keyof typeof AlbumStickerStatus];

export interface AlbumStickerView {
  readonly sticker: Sticker;
  readonly userSticker?: UserSticker;
  readonly isCollected: boolean;
  readonly isPasted: boolean;
  readonly repeatedQuantity: number;
  readonly status: AlbumStickerStatus;
}

export function buildAlbumView(
  stickers: readonly Sticker[],
  userStickers: readonly UserSticker[],
): readonly AlbumStickerView[] {
  const userStickersByStickerId = new Map(
    userStickers.map((userSticker) => [userSticker.stickerId, userSticker]),
  );

  return [...stickers]
    .sort((left, right) => left.sortOrder - right.sortOrder || left.number - right.number)
    .map((sticker) => {
      const userSticker = userStickersByStickerId.get(sticker.id);
      const repeatedQuantity = userSticker ? getRepeatedQuantity(userSticker) : 0;
      const isCollected = userSticker ? isStickerCollected(userSticker) : false;
      const isPasted = userSticker ? isStickerPasted(userSticker) : false;

      return {
        sticker,
        userSticker,
        isCollected,
        isPasted,
        repeatedQuantity,
        status: getStickerUserStatus(userSticker),
      };
    });
}

export function getStickerUserStatus(userSticker: UserSticker | undefined): AlbumStickerStatus {
  if (!userSticker || !isStickerCollected(userSticker)) {
    return AlbumStickerStatus.MISSING;
  }

  if (isStickerPasted(userSticker) && getRepeatedQuantity(userSticker) > 0) {
    return AlbumStickerStatus.REPEATED;
  }

  if (isStickerPasted(userSticker)) {
    return AlbumStickerStatus.PASTED;
  }

  return AlbumStickerStatus.COLLECTED;
}
