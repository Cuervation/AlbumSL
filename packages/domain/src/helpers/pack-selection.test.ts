import { describe, expect, it } from "vitest";

import type { Sticker } from "../entities";
import { StickerCategory, StickerEra, StickerRarity } from "../enums";
import {
  calculatePackResult,
  calculateUpdatedUserStickers,
  DEFAULT_PACK_CONFIG,
  groupStickersByRarity,
  pickPackStickers,
  pickStickerByWeightedRarity,
  validatePackConfig,
  type DomainRandomGenerator,
  type RarityWeights,
} from "./pack-selection";

describe("pack selection", () => {
  it("uses injected random values for weighted rarity and sticker selection", () => {
    const stickers = [
      createSticker("common-1", StickerRarity.COMMON, 1),
      createSticker("rare-1", StickerRarity.RARE, 2),
      createSticker("rare-2", StickerRarity.RARE, 3),
    ];
    const weights: RarityWeights = {
      [StickerRarity.COMMON]: 50,
      [StickerRarity.UNCOMMON]: 0,
      [StickerRarity.RARE]: 50,
      [StickerRarity.EPIC]: 0,
      [StickerRarity.LEGENDARY]: 0,
    };

    const pickedSticker = pickStickerByWeightedRarity(stickers, weights, randomFrom([0.75, 0.75]));

    expect(pickedSticker.stickerId).toBe("rare-2");
    expect(pickedSticker.rarity).toBe(StickerRarity.RARE);
  });

  it("pickPackStickers returns the configured pack size", () => {
    const pickedStickers = pickPackStickers(
      [createSticker("common-1", StickerRarity.COMMON, 1)],
      DEFAULT_PACK_CONFIG,
      randomFrom([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    );

    expect(pickedStickers).toHaveLength(5);
  });

  it("validatePackConfig rejects invalid config", () => {
    const validation = validatePackConfig({
      packSize: 0,
      rarityWeights: {
        [StickerRarity.COMMON]: 0,
        [StickerRarity.UNCOMMON]: 0,
        [StickerRarity.RARE]: 0,
        [StickerRarity.EPIC]: 0,
        [StickerRarity.LEGENDARY]: 0,
      },
    });

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain("packSize must be a positive integer");
    expect(validation.errors).toContain("rarityWeights must have at least one positive weight");
  });

  it("calculatePackResult marks new and repeated stickers using running quantities", () => {
    const sticker = createSticker("common-1", StickerRarity.COMMON, 1);
    const result = calculatePackResult(
      [],
      [
        { stickerId: sticker.id, sticker, rarity: sticker.rarity },
        { stickerId: sticker.id, sticker, rarity: sticker.rarity },
      ],
    );

    expect(result.newCount).toBe(1);
    expect(result.repeatedCount).toBe(1);
    expect(result.stickers.map((item) => item.isNew)).toEqual([true, false]);
    expect(result.stickers.map((item) => item.quantityAfter)).toEqual([1, 2]);
  });

  it("calculateUpdatedUserStickers increments quantities and creates missing stickers", () => {
    const existingSticker = createSticker("common-1", StickerRarity.COMMON, 1);
    const newSticker = createSticker("rare-1", StickerRarity.RARE, 2);

    const updatedUserStickers = calculateUpdatedUserStickers(
      [{ stickerId: existingSticker.id, quantity: 2, pastedQuantity: 1 }],
      [
        { stickerId: existingSticker.id, sticker: existingSticker, rarity: existingSticker.rarity },
        { stickerId: newSticker.id, sticker: newSticker, rarity: newSticker.rarity },
      ],
    );

    expect(updatedUserStickers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ stickerId: existingSticker.id, quantity: 3, pastedQuantity: 1 }),
        expect.objectContaining({ stickerId: newSticker.id, quantity: 1, pastedQuantity: 0 }),
      ]),
    );
  });

  it("ignores empty rarity buckets and redistributes weight to available stickers", () => {
    const sticker = createSticker("common-1", StickerRarity.COMMON, 1);
    const weights: RarityWeights = {
      [StickerRarity.COMMON]: 1,
      [StickerRarity.UNCOMMON]: 0,
      [StickerRarity.RARE]: 99,
      [StickerRarity.EPIC]: 0,
      [StickerRarity.LEGENDARY]: 0,
    };

    const pickedSticker = pickStickerByWeightedRarity([sticker], weights, randomFrom([0.99, 0]));

    expect(groupStickersByRarity([sticker])[StickerRarity.RARE]).toHaveLength(0);
    expect(pickedSticker.stickerId).toBe(sticker.id);
  });
});

function createSticker(id: string, rarity: StickerRarity, number: number): Sticker {
  return {
    id,
    number,
    title: id,
    description: "Test sticker",
    category: StickerCategory.PLAYER,
    era: StickerEra.POST_1990,
    rarity,
    imageUrl: `placeholder://${id}`,
    tags: [],
    sortOrder: number,
    active: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function randomFrom(values: readonly number[]): DomainRandomGenerator {
  let index = 0;

  return {
    nextFloat: () => values[index++] ?? 0,
  };
}
