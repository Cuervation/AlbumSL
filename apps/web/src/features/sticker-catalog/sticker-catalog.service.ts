import type { StickerDto } from "@albumsl/contracts";
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";

import { firestoreDb } from "../../lib/firebase";

const STICKERS_COLLECTION = "stickers";
let activeStickersCache: readonly StickerDto[] | null = null;
let activeStickersRequest: Promise<readonly StickerDto[]> | null = null;

export async function getActiveStickers(): Promise<readonly StickerDto[]> {
  if (activeStickersCache) {
    return activeStickersCache;
  }

  activeStickersRequest ??= fetchActiveStickers();
  activeStickersCache = await activeStickersRequest;
  activeStickersRequest = null;

  return activeStickersCache;
}

export function clearActiveStickersCache(): void {
  activeStickersCache = null;
  activeStickersRequest = null;
}

async function fetchActiveStickers(): Promise<readonly StickerDto[]> {
  const snapshot = await getDocs(
    query(
      collection(firestoreDb, STICKERS_COLLECTION),
      where("active", "==", true),
      orderBy("sortOrder", "asc"),
    ),
  );

  return snapshot.docs.map((document) => mapStickerDocument(document.id, document.data()));
}

function mapStickerDocument(stickerId: string, data: Record<string, unknown>): StickerDto {
  return {
    id: stringValue(data.id, stickerId),
    number: numberValue(data.number),
    title: stringValue(data.title, "Figurita sin titulo"),
    description: stringValue(data.description, ""),
    category: stringValue(data.category, "SPECIAL") as StickerDto["category"],
    era: stringValue(data.era, "POST_1990") as StickerDto["era"],
    rarity: stringValue(data.rarity, "COMMON") as StickerDto["rarity"],
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

function dateValue(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return new Date(0).toISOString();
}
