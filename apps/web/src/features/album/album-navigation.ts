import type { AlbumStickerView } from "@albumsl/domain";

export function getStickerSpreadIndex(
  orderedStickers: readonly AlbumStickerView[],
  stickerId: string | null,
  stickersPerSpread: number,
): number {
  if (!stickerId || stickersPerSpread <= 0) {
    return 0;
  }

  const stickerIndex = orderedStickers.findIndex(
    (albumSticker) => albumSticker.sticker.id === stickerId,
  );

  return stickerIndex < 0 ? 0 : Math.floor(stickerIndex / stickersPerSpread);
}
