import type { AlbumStickerView } from "@albumsl/domain";
import { describe, expect, it } from "vitest";

import { getStickerSpreadIndex } from "./album-navigation";

describe("getStickerSpreadIndex", () => {
  const stickers = Array.from({ length: 25 }, (_, index) =>
    createAlbumSticker(`sticker-${index + 1}`, index + 1),
  );

  it("returns the spread containing the requested sticker", () => {
    expect(getStickerSpreadIndex(stickers, "sticker-1", 12)).toBe(0);
    expect(getStickerSpreadIndex(stickers, "sticker-13", 12)).toBe(1);
    expect(getStickerSpreadIndex(stickers, "sticker-25", 12)).toBe(2);
  });

  it("falls back to the first spread for an unknown sticker", () => {
    expect(getStickerSpreadIndex(stickers, "unknown", 12)).toBe(0);
  });

  it("falls back safely when no sticker or invalid page size is provided", () => {
    expect(getStickerSpreadIndex(stickers, null, 12)).toBe(0);
    expect(getStickerSpreadIndex(stickers, "sticker-13", 0)).toBe(0);
  });
});

function createAlbumSticker(id: string, number: number): AlbumStickerView {
  return {
    sticker: {
      id,
      number,
      title: id,
      description: "",
      category: "PLAYER",
      era: "POST_1990",
      rarity: "COMMON",
      imageUrl: "placeholder://sticker",
      tags: [],
      sortOrder: number,
      active: true,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    },
    isCollected: true,
    isPasted: false,
    placementState: "UNPASTED",
    duplicateQuantity: 1,
    repeatedQuantity: 1,
    status: "COLLECTED",
  };
}
