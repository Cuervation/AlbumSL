import { describe, expect, it } from "vitest";

import type { Sticker } from "../entities";
import { StickerCategory, StickerEra, StickerRarity } from "../enums";
import { validateStickerCatalogDistribution } from "./catalog-validation";

function createSticker(index: number, era: StickerEra): Sticker {
  return {
    id: `sticker-${index}`,
    number: index,
    title: `Sticker ${index}`,
    category: StickerCategory.PLAYER,
    era,
    rarity: StickerRarity.COMMON,
    tags: [],
  };
}

describe("catalog validation", () => {
  it("accepts a catalog with minimum size and 30/70 era distribution", () => {
    const stickers = [
      ...Array.from({ length: 180 }, (_, index) => createSticker(index + 1, StickerEra.PRE_1990)),
      ...Array.from({ length: 420 }, (_, index) =>
        createSticker(index + 181, StickerEra.POST_1990),
      ),
    ];

    const validation = validateStickerCatalogDistribution(stickers);

    expect(validation.isValid).toBe(true);
    expect(validation.totalStickers).toBe(600);
    expect(validation.pre1990Count).toBe(180);
    expect(validation.post1990Count).toBe(420);
  });

  it("rejects an empty catalog", () => {
    const validation = validateStickerCatalogDistribution([]);

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain("catalog must have at least 600 stickers");
  });

  it("rejects a catalog outside the expected distribution", () => {
    const stickers = Array.from({ length: 600 }, (_, index) =>
      createSticker(index + 1, StickerEra.POST_1990),
    );

    const validation = validateStickerCatalogDistribution(stickers);

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain("PRE_1990 distribution must be approximately 30%");
  });
});
