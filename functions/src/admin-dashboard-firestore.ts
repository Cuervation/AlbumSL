import type { AdminRecentPackClaimDto, AdminRecentPackOpeningDto } from "@albumsl/contracts";
import type { Firestore } from "firebase-admin/firestore";

import type { AdminDashboardDataSource } from "./admin-dashboard.js";

export function createFirestoreAdminDashboardDataSource(db: Firestore): AdminDashboardDataSource {
  return {
    countUsers: () => countCollection(db, "users"),
    countStickers: () => countCollection(db, "stickers"),
    countActiveStickers: () => countCollectionWhere(db, "stickers", "active", true),
    countInactiveStickers: () => countCollectionWhere(db, "stickers", "active", false),
    countPackOpenings: () => countCollection(db, "packOpenings"),
    countPackClaims: () => countCollection(db, "packClaims"),
    getRecentPackOpenings: async (limit) => {
      const snapshot = await db
        .collection("packOpenings")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map((document): AdminRecentPackOpeningDto => {
        const data = document.data() as Record<string, unknown>;

        return {
          id: stringValue(data.id, document.id),
          userId: stringValue(data.userId, ""),
          source: stringValue(data.source, ""),
          claimId: optionalStringValue(data.claimId),
          newCount: numberValue(data.newCount),
          repeatedCount: numberValue(data.repeatedCount),
          createdAt: dateValue(data.createdAt),
        };
      });
    },
    getRecentPackClaims: async (limit) => {
      const snapshot = await db
        .collection("packClaims")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map((document): AdminRecentPackClaimDto => {
        const data = document.data() as Record<string, unknown>;

        return {
          id: stringValue(data.id, document.id),
          userId: stringValue(data.userId, ""),
          source: stringValue(data.source, ""),
          status: stringValue(data.status, ""),
          createdAt: dateValue(data.createdAt),
          expiresAt: optionalDateValue(data.expiresAt),
          consumedAt: optionalDateValue(data.consumedAt),
        };
      });
    },
  };
}

async function countCollection(db: Firestore, collectionPath: string): Promise<number> {
  const snapshot = await db.collection(collectionPath).count().get();
  return snapshot.data().count;
}

async function countCollectionWhere(
  db: Firestore,
  collectionPath: string,
  field: string,
  value: unknown,
): Promise<number> {
  const snapshot = await db.collection(collectionPath).where(field, "==", value).count().get();
  return snapshot.data().count;
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function optionalStringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function optionalDateValue(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return dateValue(value);
}

function dateValue(value: unknown): string {
  if (isTimestampLike(value)) {
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

function isTimestampLike(value: unknown): value is { readonly toDate: () => Date } {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  );
}
