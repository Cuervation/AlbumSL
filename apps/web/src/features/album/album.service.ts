import type {
  PasteStickerRequestDto,
  PasteStickerResponseDto,
  StickerDto,
  UserAlbumSummaryDto,
} from "@albumsl/contracts";
import type { Sticker, UserSticker } from "@albumsl/domain";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import { firebaseFunctions, firestoreDb } from "../../lib/firebase";
import { getActiveStickers } from "../sticker-catalog/sticker-catalog.service";

export interface RecentPackOpening {
  readonly id: string;
  readonly source: string;
  readonly newCount: number;
  readonly repeatedCount: number;
  readonly createdAt: string;
}

const pasteStickerCallable = httpsCallable<PasteStickerRequestDto, PasteStickerResponseDto>(
  firebaseFunctions,
  "pasteSticker",
);

export async function getActiveAlbumStickers(): Promise<readonly Sticker[]> {
  const stickerDtos = await getActiveStickers();
  return stickerDtos.map(mapStickerDtoToDomain);
}

export async function getUserStickers(userId: string): Promise<readonly UserSticker[]> {
  const snapshot = await getDocs(collection(firestoreDb, "userStickers", userId, "items"));

  return snapshot.docs.map((document) => mapUserStickerDocument(document.id, document.data()));
}

export async function getUserAlbumSummary(userId: string): Promise<UserAlbumSummaryDto | null> {
  const snapshot = await getDoc(doc(firestoreDb, "userAlbums", userId));

  if (!snapshot.exists()) {
    return null;
  }

  return mapUserAlbumSummaryDocument(userId, snapshot.data());
}

export async function getRecentPackOpenings(
  userId: string,
  maxResults = 5,
): Promise<readonly RecentPackOpening[]> {
  const snapshot = await getDocs(
    query(
      collection(firestoreDb, "packOpenings"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(maxResults),
    ),
  );

  return snapshot.docs.map((document) => ({
    id: document.id,
    source: stringValue(document.data().source, "DAILY"),
    newCount: numberValue(document.data().newCount),
    repeatedCount: numberValue(document.data().repeatedCount),
    createdAt: dateValue(document.data().createdAt),
  }));
}

export async function pasteSticker(stickerId: string): Promise<PasteStickerResponseDto> {
  const response = await pasteStickerCallable({ stickerId });
  return response.data;
}

function mapStickerDtoToDomain(sticker: StickerDto): Sticker {
  return {
    ...sticker,
    createdAt: new Date(sticker.createdAt),
    updatedAt: new Date(sticker.updatedAt),
  };
}

function mapUserStickerDocument(stickerId: string, data: Record<string, unknown>): UserSticker {
  return {
    stickerId: stringValue(data.stickerId, stickerId),
    quantity: numberValue(data.quantity),
    pastedQuantity: numberValue(data.pastedQuantity),
    firstCollectedAt: optionalDateValue(data.firstCollectedAt),
    lastCollectedAt: optionalDateValue(data.lastCollectedAt),
    updatedAt: optionalDateValue(data.updatedAt),
  };
}

function mapUserAlbumSummaryDocument(
  userId: string,
  data: Record<string, unknown>,
): UserAlbumSummaryDto {
  return {
    userId: stringValue(data.userId, userId),
    totalStickers: numberValue(data.totalStickers),
    collectedCount: numberValue(data.collectedCount),
    pastedCount: numberValue(data.pastedCount),
    repeatedCount: numberValue(data.repeatedCount),
    completionPercentage: numberValue(data.completionPercentage),
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

function optionalDateValue(value: unknown): Date | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return new Date(dateValue(value));
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
