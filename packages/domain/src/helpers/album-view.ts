import type { Sticker, UserSticker } from "../entities.js";
import {
  getDuplicateQuantity,
  getRepeatedQuantity,
  isStickerCollected,
  isStickerPasted,
} from "./user-stickers.js";

export const AlbumStickerStatus = {
  MISSING: "MISSING",
  COLLECTED: "COLLECTED",
  PASTED: "PASTED",
  REPEATED: "REPEATED",
} as const;

export type AlbumStickerStatus = (typeof AlbumStickerStatus)[keyof typeof AlbumStickerStatus];

export const AlbumStickerPlacementState = {
  MISSING: "MISSING",
  UNPASTED: "UNPASTED",
  PASTED: "PASTED",
} as const;

export type AlbumStickerPlacementState =
  (typeof AlbumStickerPlacementState)[keyof typeof AlbumStickerPlacementState];

export interface AlbumStickerView {
  readonly sticker: Sticker;
  readonly userSticker?: UserSticker;
  readonly isCollected: boolean;
  readonly isPasted: boolean;
  readonly placementState: AlbumStickerPlacementState;
  readonly duplicateQuantity: number;
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
      const duplicateQuantity = userSticker ? getDuplicateQuantity(userSticker) : 0;
      const isCollected = userSticker ? isStickerCollected(userSticker) : false;
      const isPasted = userSticker ? isStickerPasted(userSticker) : false;

      return {
        sticker,
        userSticker,
        isCollected,
        isPasted,
        placementState: getStickerPlacementState(userSticker),
        duplicateQuantity,
        repeatedQuantity: duplicateQuantity,
        status: getStickerUserStatus(userSticker),
      };
    });
}

export function getStickerPlacementState(
  userSticker: UserSticker | undefined,
): AlbumStickerPlacementState {
  if (!userSticker || !isStickerCollected(userSticker)) {
    return AlbumStickerPlacementState.MISSING;
  }

  if (isStickerPasted(userSticker)) {
    return AlbumStickerPlacementState.PASTED;
  }

  return AlbumStickerPlacementState.UNPASTED;
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
