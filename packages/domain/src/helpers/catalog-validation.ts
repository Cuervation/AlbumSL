import {
  MIN_STICKER_CATALOG_SIZE,
  POST_1990_TARGET_RATIO,
  PRE_1990_TARGET_RATIO,
  STICKER_CATALOG_DISTRIBUTION_TOLERANCE,
} from "../constants";
import type { Sticker } from "../entities";
import { StickerEra } from "../enums";
import type { DomainValidationResult } from "../errors";

export interface StickerCatalogDistributionValidation extends DomainValidationResult {
  readonly totalStickers: number;
  readonly pre1990Count: number;
  readonly post1990Count: number;
  readonly pre1990Ratio: number;
  readonly post1990Ratio: number;
}

export function validateStickerCatalogDistribution(
  stickers: readonly Sticker[],
): StickerCatalogDistributionValidation {
  const totalStickers = stickers.length;
  const pre1990Count = stickers.filter((sticker) => sticker.era === StickerEra.PRE_1990).length;
  const post1990Count = stickers.filter((sticker) => sticker.era === StickerEra.POST_1990).length;
  const pre1990Ratio = totalStickers === 0 ? 0 : pre1990Count / totalStickers;
  const post1990Ratio = totalStickers === 0 ? 0 : post1990Count / totalStickers;
  const errors: string[] = [];

  if (totalStickers < MIN_STICKER_CATALOG_SIZE) {
    errors.push(`catalog must have at least ${MIN_STICKER_CATALOG_SIZE} stickers`);
  }

  if (!isWithinTolerance(pre1990Ratio, PRE_1990_TARGET_RATIO)) {
    errors.push("PRE_1990 distribution must be approximately 30%");
  }

  if (!isWithinTolerance(post1990Ratio, POST_1990_TARGET_RATIO)) {
    errors.push("POST_1990 distribution must be approximately 70%");
  }

  return {
    isValid: errors.length === 0,
    errors,
    totalStickers,
    pre1990Count,
    post1990Count,
    pre1990Ratio,
    post1990Ratio,
  };
}

function isWithinTolerance(actual: number, expected: number): boolean {
  return Math.abs(actual - expected) <= STICKER_CATALOG_DISTRIBUTION_TOLERANCE;
}
