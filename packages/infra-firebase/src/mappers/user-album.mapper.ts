import type { UserAlbumSummary } from "@albumsl/domain";

import { dateValue, stringValue } from "./firestore-value.mapper.js";

export interface FirestoreUserAlbumDocument {
  readonly userId: string;
  readonly totalStickers: number;
  readonly collectedCount: number;
  readonly pastedCount: number;
  readonly repeatedCount: number;
  readonly completionPercentage: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export function toFirestoreUserAlbumDocument(
  summary: UserAlbumSummary,
): FirestoreUserAlbumDocument {
  return {
    userId: summary.userId,
    totalStickers: summary.totalStickers,
    collectedCount: summary.collectedCount,
    pastedCount: summary.pastedCount,
    repeatedCount: summary.repeatedCount,
    completionPercentage: summary.completionPercentage,
    createdAt: summary.createdAt,
    updatedAt: summary.updatedAt,
  };
}

export function fromFirestoreUserAlbumDocument(
  userId: string,
  data: FirebaseFirestore.DocumentData,
): UserAlbumSummary {
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

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}
