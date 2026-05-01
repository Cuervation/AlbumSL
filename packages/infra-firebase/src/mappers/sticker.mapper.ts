import type { Sticker } from "@albumsl/domain";
import { StickerCategory, StickerEra, StickerRarity } from "@albumsl/domain";
import { Timestamp } from "firebase-admin/firestore";

export interface FirestoreStickerDocument {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly description: string;
  readonly category: StickerCategory;
  readonly era: StickerEra;
  readonly rarity: StickerRarity;
  readonly imageUrl: string;
  readonly tags: readonly string[];
  readonly sortOrder: number;
  readonly active: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function toFirestoreStickerDocument(sticker: Sticker): FirestoreStickerDocument {
  return {
    id: sticker.id,
    number: sticker.number,
    title: sticker.title,
    description: sticker.description,
    category: sticker.category,
    era: sticker.era,
    rarity: sticker.rarity,
    imageUrl: sticker.imageUrl,
    tags: sticker.tags,
    sortOrder: sticker.sortOrder,
    active: sticker.active,
    createdAt: sticker.createdAt,
    updatedAt: sticker.updatedAt,
  };
}

export function fromFirestoreStickerDocument(
  stickerId: string,
  data: FirebaseFirestore.DocumentData,
): Sticker {
  return {
    id: stringValue(data.id, stickerId),
    number: numberValue(data.number),
    title: stringValue(data.title, ""),
    description: stringValue(data.description, ""),
    category: enumValue(StickerCategory, data.category, StickerCategory.SPECIAL),
    era: enumValue(StickerEra, data.era, StickerEra.POST_1990),
    rarity: enumValue(StickerRarity, data.rarity, StickerRarity.COMMON),
    imageUrl: stringValue(data.imageUrl, ""),
    tags: stringArrayValue(data.tags),
    sortOrder: numberValue(data.sortOrder),
    active: booleanValue(data.active),
    createdAt: dateValue(data.createdAt),
    updatedAt: dateValue(data.updatedAt),
  };
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function booleanValue(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

function stringArrayValue(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function dateValue(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
  }

  return new Date(0);
}

function enumValue<T extends string>(
  enumObject: Record<string, T>,
  value: unknown,
  fallback: T,
): T {
  return typeof value === "string" && Object.values(enumObject).includes(value as T)
    ? (value as T)
    : fallback;
}
