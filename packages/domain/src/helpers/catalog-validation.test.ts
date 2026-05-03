import { describe, expect, it } from "vitest";

import type { Sticker } from "../entities";
import { StickerCategory, StickerEra, StickerRarity } from "../enums";
import { DomainValidationError } from "../errors";
import { initialStickerSeed, INITIAL_STICKER_SEED_MIN_EXPECTED } from "../seed/stickers.seed";
import {
  assertUniqueStickerIds,
  assertUniqueStickerNumbers,
  getStickerCatalogDistribution,
  getStickerCatalogStats,
  validateStickerCatalog,
  validateStickerCatalogDistribution,
} from "./catalog-validation";

function createSticker(overrides: Partial<Sticker> = {}): Sticker {
  const number = overrides.number ?? 1;

  return {
    id: `sticker-${number}`,
    number,
    title: `Sticker ${number}`,
    description: `Description ${number}`,
    category: StickerCategory.PLAYER,
    era: StickerEra.POST_1990,
    rarity: StickerRarity.COMMON,
    imageUrl: `placeholder://test/${number}`,
    tags: [],
    sortOrder: number,
    active: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("catalog validation", () => {
  it("accepts a catalog with minimum size and 30/70 era distribution", () => {
    const stickers = [
      ...Array.from({ length: 180 }, (_, index) =>
        createSticker({
          id: `pre-${index + 1}`,
          number: index + 1,
          era: StickerEra.PRE_1990,
        }),
      ),
      ...Array.from({ length: 420 }, (_, index) =>
        createSticker({
          id: `post-${index + 1}`,
          number: index + 181,
          era: StickerEra.POST_1990,
        }),
      ),
    ];

    const validation = validateStickerCatalogDistribution(stickers);

    expect(validation.isValid).toBe(true);
    expect(validation.totalStickers).toBe(600);
    expect(validation.pre1990Count).toBe(180);
    expect(validation.post1990Count).toBe(420);
  });

  it("rejects an empty catalog with default product minimum", () => {
    const validation = validateStickerCatalogDistribution([]);

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain("catalog must have at least 600 stickers");
  });

  it("rejects a catalog outside the expected distribution", () => {
    const stickers = Array.from({ length: 600 }, (_, index) =>
      createSticker({
        id: `post-${index + 1}`,
        number: index + 1,
        era: StickerEra.POST_1990,
      }),
    );

    const validation = validateStickerCatalogDistribution(stickers);

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain("PRE_1990 distribution must be approximately 30%");
  });

  it("throws when sticker numbers are duplicated", () => {
    expect(() =>
      assertUniqueStickerNumbers([
        createSticker({ id: "a", number: 1 }),
        createSticker({ id: "b", number: 1 }),
      ]),
    ).toThrow(DomainValidationError);
  });

  it("throws when sticker ids are duplicated", () => {
    expect(() =>
      assertUniqueStickerIds([
        createSticker({ id: "same", number: 1 }),
        createSticker({ id: "same", number: 2 }),
      ]),
    ).toThrow(DomainValidationError);
  });

  it("returns catalog stats by category, era and rarity", () => {
    const stats = getStickerCatalogStats([
      createSticker({
        id: "a",
        number: 1,
        category: StickerCategory.PLAYER,
        era: StickerEra.PRE_1990,
        rarity: StickerRarity.RARE,
      }),
      createSticker({
        id: "b",
        number: 2,
        category: StickerCategory.COACH,
        era: StickerEra.POST_1990,
        rarity: StickerRarity.COMMON,
        active: false,
      }),
    ]);

    expect(stats.totalStickers).toBe(2);
    expect(stats.activeStickers).toBe(1);
    expect(stats.inactiveStickers).toBe(1);
    expect(stats.byCategory.PLAYER).toBe(1);
    expect(stats.byCategory.COACH).toBe(1);
    expect(stats.byEra.PRE_1990).toBe(1);
    expect(stats.byEra.POST_1990).toBe(1);
    expect(stats.byRarity.RARE).toBe(1);
    expect(stats.byRarity.COMMON).toBe(1);
  });

  it("returns catalog distribution", () => {
    const distribution = getStickerCatalogDistribution([
      createSticker({ id: "a", number: 1, era: StickerEra.PRE_1990 }),
      createSticker({ id: "b", number: 2, era: StickerEra.POST_1990 }),
    ]);

    expect(distribution).toEqual({
      totalStickers: 2,
      pre1990Count: 1,
      post1990Count: 1,
      pre1990Ratio: 0.5,
      post1990Ratio: 0.5,
    });
  });

  it("allows empty descriptions for curated seed stickers", () => {
    const validation = validateStickerCatalog([
      createSticker({ id: "seed-1", number: 1, description: "", era: StickerEra.POST_1990 }),
      ...Array.from({ length: 599 }, (_, index) =>
        createSticker({
          id: `seed-${index + 2}`,
          number: index + 2,
          era: index < 179 ? StickerEra.PRE_1990 : StickerEra.POST_1990,
        }),
      ),
    ]);

    expect(validation.isValid).toBe(true);
  });

  it("validates the initial sticker seed with a configurable minimum", () => {
    const validation = validateStickerCatalog(initialStickerSeed, {
      minExpectedStickers: INITIAL_STICKER_SEED_MIN_EXPECTED,
    });

    expect(validation.isValid).toBe(true);
    expect(validation.stats.totalStickers).toBe(50);
    expect(validation.distribution.pre1990Count).toBe(15);
    expect(validation.distribution.post1990Count).toBe(35);
  });
});
