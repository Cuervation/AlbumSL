import {
  MIN_STICKER_CATALOG_SIZE,
  POST_1990_TARGET_RATIO,
  PRE_1990_TARGET_RATIO,
  STICKER_CATALOG_DISTRIBUTION_TOLERANCE,
} from "../constants.js";
import type { Sticker } from "../entities.js";
import { StickerCategory, StickerEra, StickerRarity } from "../enums.js";
import { DomainValidationError, type DomainValidationResult } from "../errors.js";

export interface StickerCatalogValidationOptions {
  readonly minExpectedStickers?: number;
  readonly distributionTolerance?: number;
}

export interface StickerCatalogDistribution {
  readonly totalStickers: number;
  readonly pre1990Count: number;
  readonly post1990Count: number;
  readonly pre1990Ratio: number;
  readonly post1990Ratio: number;
}

export interface StickerCatalogStats {
  readonly totalStickers: number;
  readonly activeStickers: number;
  readonly inactiveStickers: number;
  readonly byCategory: Readonly<Record<StickerCategory, number>>;
  readonly byEra: Readonly<Record<StickerEra, number>>;
  readonly byRarity: Readonly<Record<StickerRarity, number>>;
}

export interface StickerCatalogValidationResult extends DomainValidationResult {
  readonly stats: StickerCatalogStats;
  readonly distribution: StickerCatalogDistribution;
}

export interface StickerCatalogDistributionValidation
  extends DomainValidationResult, StickerCatalogDistribution {}

export function validateStickerCatalog(
  stickers: readonly Sticker[],
  options: StickerCatalogValidationOptions = {},
): StickerCatalogValidationResult {
  const errors: string[] = [];
  const minExpectedStickers = options.minExpectedStickers ?? MIN_STICKER_CATALOG_SIZE;
  const distributionTolerance =
    options.distributionTolerance ?? STICKER_CATALOG_DISTRIBUTION_TOLERANCE;
  const distribution = getStickerCatalogDistribution(stickers);

  if (stickers.length < minExpectedStickers) {
    errors.push(`catalog must have at least ${minExpectedStickers} stickers`);
  }

  errors.push(...collectDuplicateErrors(stickers));

  for (const sticker of stickers) {
    errors.push(...validateStickerFields(sticker));
  }

  if (!isWithinTolerance(distribution.pre1990Ratio, PRE_1990_TARGET_RATIO, distributionTolerance)) {
    errors.push("PRE_1990 distribution must be approximately 30%");
  }

  if (
    !isWithinTolerance(distribution.post1990Ratio, POST_1990_TARGET_RATIO, distributionTolerance)
  ) {
    errors.push("POST_1990 distribution must be approximately 70%");
  }

  return {
    isValid: errors.length === 0,
    errors,
    stats: getStickerCatalogStats(stickers),
    distribution,
  };
}

export function assertUniqueStickerNumbers(stickers: readonly Sticker[]): void {
  const duplicatedNumbers = getDuplicates(stickers.map((sticker) => sticker.number));

  if (duplicatedNumbers.length > 0) {
    throw new DomainValidationError("Sticker numbers must be unique", [
      `duplicated numbers: ${duplicatedNumbers.join(", ")}`,
    ]);
  }
}

export function assertUniqueStickerIds(stickers: readonly Sticker[]): void {
  const duplicatedIds = getDuplicates(stickers.map((sticker) => sticker.id));

  if (duplicatedIds.length > 0) {
    throw new DomainValidationError("Sticker ids must be unique", [
      `duplicated ids: ${duplicatedIds.join(", ")}`,
    ]);
  }
}

export function getStickerCatalogStats(stickers: readonly Sticker[]): StickerCatalogStats {
  return {
    totalStickers: stickers.length,
    activeStickers: stickers.filter((sticker) => sticker.active).length,
    inactiveStickers: stickers.filter((sticker) => !sticker.active).length,
    byCategory: countByEnumValue(stickers, StickerCategory, (sticker) => sticker.category),
    byEra: countByEnumValue(stickers, StickerEra, (sticker) => sticker.era),
    byRarity: countByEnumValue(stickers, StickerRarity, (sticker) => sticker.rarity),
  };
}

export function getStickerCatalogDistribution(
  stickers: readonly Sticker[],
): StickerCatalogDistribution {
  const totalStickers = stickers.length;
  const pre1990Count = stickers.filter((sticker) => sticker.era === StickerEra.PRE_1990).length;
  const post1990Count = stickers.filter((sticker) => sticker.era === StickerEra.POST_1990).length;

  return {
    totalStickers,
    pre1990Count,
    post1990Count,
    pre1990Ratio: totalStickers === 0 ? 0 : pre1990Count / totalStickers,
    post1990Ratio: totalStickers === 0 ? 0 : post1990Count / totalStickers,
  };
}

export function validateStickerCatalogDistribution(
  stickers: readonly Sticker[],
  options: StickerCatalogValidationOptions = {},
): StickerCatalogDistributionValidation {
  const validation = validateStickerCatalog(stickers, options);

  return {
    isValid: validation.isValid,
    errors: validation.errors,
    ...validation.distribution,
  };
}

function collectDuplicateErrors(stickers: readonly Sticker[]): readonly string[] {
  const errors: string[] = [];
  const duplicatedIds = getDuplicates(stickers.map((sticker) => sticker.id));
  const duplicatedNumbers = getDuplicates(stickers.map((sticker) => sticker.number));

  if (duplicatedIds.length > 0) {
    errors.push(`duplicated sticker ids: ${duplicatedIds.join(", ")}`);
  }

  if (duplicatedNumbers.length > 0) {
    errors.push(`duplicated sticker numbers: ${duplicatedNumbers.join(", ")}`);
  }

  return errors;
}

function validateStickerFields(sticker: Sticker): readonly string[] {
  const errors: string[] = [];

  if (sticker.id.trim().length === 0) {
    errors.push("sticker id is required");
  }

  if (!Number.isInteger(sticker.number) || sticker.number <= 0) {
    errors.push(`sticker ${sticker.id} number must be a positive integer`);
  }

  if (sticker.title.trim().length === 0) {
    errors.push(`sticker ${sticker.id} title is required`);
  }

  if (sticker.description.trim().length === 0) {
    errors.push(`sticker ${sticker.id} description is required`);
  }

  if (!isEnumValue(StickerCategory, sticker.category)) {
    errors.push(`sticker ${sticker.id} category is invalid`);
  }

  if (!isEnumValue(StickerEra, sticker.era)) {
    errors.push(`sticker ${sticker.id} era is invalid`);
  }

  if (!isEnumValue(StickerRarity, sticker.rarity)) {
    errors.push(`sticker ${sticker.id} rarity is invalid`);
  }

  if (sticker.imageUrl.trim().length === 0) {
    errors.push(`sticker ${sticker.id} imageUrl is required`);
  }

  if (!Number.isInteger(sticker.sortOrder) || sticker.sortOrder <= 0) {
    errors.push(`sticker ${sticker.id} sortOrder must be a positive integer`);
  }

  if (!(sticker.createdAt instanceof Date) || Number.isNaN(sticker.createdAt.getTime())) {
    errors.push(`sticker ${sticker.id} createdAt must be a valid Date`);
  }

  if (!(sticker.updatedAt instanceof Date) || Number.isNaN(sticker.updatedAt.getTime())) {
    errors.push(`sticker ${sticker.id} updatedAt must be a valid Date`);
  }

  return errors;
}

function getDuplicates<T extends string | number>(values: readonly T[]): readonly T[] {
  const seen = new Set<T>();
  const duplicated = new Set<T>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicated.add(value);
    }

    seen.add(value);
  }

  return [...duplicated];
}

function countByEnumValue<T extends string, TItem>(
  items: readonly TItem[],
  enumObject: Record<string, T>,
  getValue: (item: TItem) => T,
): Readonly<Record<T, number>> {
  const initialCounts = Object.values(enumObject).reduce<Record<T, number>>(
    (counts, value) => ({
      ...counts,
      [value]: 0,
    }),
    {} as Record<T, number>,
  );

  return items.reduce<Record<T, number>>((counts, item) => {
    const value = getValue(item);

    return {
      ...counts,
      [value]: (counts[value] ?? 0) + 1,
    };
  }, initialCounts);
}

function isEnumValue<T extends string>(enumObject: Record<string, T>, value: string): value is T {
  return Object.values(enumObject).includes(value as T);
}

function isWithinTolerance(actual: number, expected: number, tolerance: number): boolean {
  return Math.abs(actual - expected) <= tolerance;
}
