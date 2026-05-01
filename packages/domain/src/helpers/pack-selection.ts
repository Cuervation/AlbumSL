import { DEFAULT_PACK_SIZE } from "../constants.js";
import type { Sticker, StickerId, UserSticker } from "../entities.js";
import { StickerRarity, type PackSource } from "../enums.js";
import { DomainValidationError, type DomainValidationResult } from "../errors.js";

export type RarityWeights = Readonly<Record<StickerRarity, number>>;

export interface PackConfig {
  readonly packSize: number;
  readonly rarityWeights: RarityWeights;
}

export interface DomainRandomGenerator {
  nextFloat(): number;
}

export interface PickedSticker {
  readonly stickerId: StickerId;
  readonly sticker: Sticker;
  readonly rarity: StickerRarity;
}

export interface PackStickerResult {
  readonly sticker: Sticker;
  readonly isNew: boolean;
  readonly quantityAfter: number;
}

export interface PackResult {
  readonly stickers: readonly PackStickerResult[];
  readonly newCount: number;
  readonly repeatedCount: number;
}

export interface PackOpenResult {
  readonly packOpeningId: string;
  readonly source: PackSource;
  readonly claimId: string;
  readonly stickers: readonly PackStickerResult[];
  readonly newCount: number;
  readonly repeatedCount: number;
  readonly createdAt: Date;
}

export type StickersByRarity = Readonly<Record<StickerRarity, readonly Sticker[]>>;

export const DEFAULT_RARITY_WEIGHTS: RarityWeights = {
  [StickerRarity.COMMON]: 70,
  [StickerRarity.UNCOMMON]: 20,
  [StickerRarity.RARE]: 7,
  [StickerRarity.EPIC]: 2,
  [StickerRarity.LEGENDARY]: 1,
};

export const DEFAULT_PACK_CONFIG: PackConfig = {
  packSize: DEFAULT_PACK_SIZE,
  rarityWeights: DEFAULT_RARITY_WEIGHTS,
};

const ALL_RARITIES = Object.values(StickerRarity);

export function getRarityWeight(rarity: StickerRarity, weights: RarityWeights): number {
  return Math.max(weights[rarity] ?? 0, 0);
}

export function groupStickersByRarity(stickers: readonly Sticker[]): StickersByRarity {
  return ALL_RARITIES.reduce(
    (groups, rarity) => ({
      ...groups,
      [rarity]: stickers.filter((sticker) => sticker.rarity === rarity),
    }),
    {} as Record<StickerRarity, readonly Sticker[]>,
  );
}

export function validatePackConfig(config: PackConfig): DomainValidationResult {
  const errors: string[] = [];

  if (!Number.isInteger(config.packSize) || config.packSize <= 0) {
    errors.push("packSize must be a positive integer");
  }

  const totalWeight = ALL_RARITIES.reduce(
    (total, rarity) => total + getRarityWeight(rarity, config.rarityWeights),
    0,
  );

  if (totalWeight <= 0) {
    errors.push("rarityWeights must have at least one positive weight");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function pickStickerByWeightedRarity(
  stickers: readonly Sticker[],
  weights: RarityWeights,
  random: DomainRandomGenerator,
): PickedSticker {
  const activeStickers = stickers.filter((sticker) => sticker.active);

  if (activeStickers.length === 0) {
    throw new DomainValidationError("No active stickers available", ["stickers cannot be empty"]);
  }

  const stickersByRarity = groupStickersByRarity(activeStickers);
  const weightedRarities = ALL_RARITIES.map((rarity) => ({
    rarity,
    stickers: stickersByRarity[rarity],
    weight: getRarityWeight(rarity, weights),
  })).filter((entry) => entry.weight > 0 && entry.stickers.length > 0);

  if (weightedRarities.length === 0) {
    throw new DomainValidationError("No weighted stickers available", [
      "at least one rarity with positive weight must have active stickers",
    ]);
  }

  const totalWeight = weightedRarities.reduce((total, entry) => total + entry.weight, 0);
  const rarityRoll = clampRandom(random.nextFloat()) * totalWeight;
  let accumulatedWeight = 0;
  const fallbackRarity = weightedRarities[weightedRarities.length - 1];
  const selectedRarity =
    weightedRarities.find((entry) => {
      accumulatedWeight += entry.weight;
      return rarityRoll < accumulatedWeight;
    }) ?? fallbackRarity;

  if (!selectedRarity) {
    throw new DomainValidationError("No weighted stickers available", [
      "at least one rarity with positive weight must have active stickers",
    ]);
  }

  const stickerIndex = Math.floor(clampRandom(random.nextFloat()) * selectedRarity.stickers.length);
  const sticker = selectedRarity.stickers[stickerIndex] ?? selectedRarity.stickers[0];

  if (!sticker) {
    throw new DomainValidationError("No stickers available for selected rarity", [
      `${selectedRarity.rarity} has no active stickers`,
    ]);
  }

  return {
    stickerId: sticker.id,
    sticker,
    rarity: selectedRarity.rarity,
  };
}

export function pickPackStickers(
  stickers: readonly Sticker[],
  config: PackConfig,
  random: DomainRandomGenerator,
): readonly PickedSticker[] {
  const validation = validatePackConfig(config);

  if (!validation.isValid) {
    throw new DomainValidationError("Invalid pack config", validation.errors);
  }

  return Array.from({ length: config.packSize }, () =>
    pickStickerByWeightedRarity(stickers, config.rarityWeights, random),
  );
}

export function calculatePackResult(
  previousUserStickers: readonly UserSticker[],
  pickedStickers: readonly PickedSticker[],
): PackResult {
  const runningQuantities = new Map(
    previousUserStickers.map((userSticker) => [userSticker.stickerId, userSticker.quantity]),
  );
  const stickerResults = pickedStickers.map((pickedSticker) => {
    const previousQuantity = runningQuantities.get(pickedSticker.stickerId) ?? 0;
    const quantityAfter = previousQuantity + 1;
    runningQuantities.set(pickedSticker.stickerId, quantityAfter);

    return {
      sticker: pickedSticker.sticker,
      isNew: previousQuantity === 0,
      quantityAfter,
    };
  });

  return {
    stickers: stickerResults,
    newCount: stickerResults.filter((result) => result.isNew).length,
    repeatedCount: stickerResults.filter((result) => !result.isNew).length,
  };
}

export function calculateUpdatedUserStickers(
  previousUserStickers: readonly UserSticker[],
  pickedStickers: readonly PickedSticker[],
): readonly UserSticker[] {
  const userStickersById = new Map(
    previousUserStickers.map((userSticker) => [userSticker.stickerId, userSticker]),
  );

  for (const pickedSticker of pickedStickers) {
    const currentUserSticker = userStickersById.get(pickedSticker.stickerId);

    userStickersById.set(
      pickedSticker.stickerId,
      currentUserSticker
        ? {
            ...currentUserSticker,
            quantity: currentUserSticker.quantity + 1,
          }
        : {
            stickerId: pickedSticker.stickerId,
            quantity: 1,
            pastedQuantity: 0,
          },
    );
  }

  return [...userStickersById.values()];
}

function clampRandom(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), 0.999999999999);
}
