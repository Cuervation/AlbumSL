import type { AlbumStickerView } from "@albumsl/domain";

export function getExchangeableQuantity(albumSticker: AlbumStickerView): number {
  return albumSticker.duplicateQuantity;
}

export function isExchangeableSticker(albumSticker: AlbumStickerView): boolean {
  return getExchangeableQuantity(albumSticker) > 0;
}
