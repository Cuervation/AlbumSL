import { PackSource, type PackOpening } from "@albumsl/domain";

import {
  dateValue,
  enumValue,
  metadataValue,
  optionalStringValue,
  stringValue,
} from "./firestore-value.mapper.js";

export interface FirestorePackOpeningDocument {
  readonly id: string;
  readonly userId: string;
  readonly source: PackSource;
  readonly claimId: string;
  readonly stickerIds: readonly string[];
  readonly newCount: number;
  readonly repeatedCount: number;
  readonly createdAt: Date;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly auditLogId?: string;
}

export function toFirestorePackOpeningDocument(
  packOpening: PackOpening,
): FirestorePackOpeningDocument {
  return {
    id: packOpening.id,
    userId: packOpening.userId,
    source: packOpening.source,
    claimId: packOpening.claimId,
    stickerIds: packOpening.stickerIds,
    newCount: packOpening.newCount,
    repeatedCount: packOpening.repeatedCount,
    createdAt: packOpening.createdAt,
    metadata: packOpening.metadata ?? {},
    auditLogId: packOpening.auditLogId,
  };
}

export function fromFirestorePackOpeningDocument(
  openingId: string,
  data: FirebaseFirestore.DocumentData,
): PackOpening {
  return {
    id: stringValue(data.id, openingId),
    userId: stringValue(data.userId, ""),
    source: enumValue(PackSource, data.source, PackSource.DAILY),
    claimId: stringValue(data.claimId, ""),
    stickerIds: stringArrayValue(data.stickerIds),
    newCount: numberValue(data.newCount),
    repeatedCount: numberValue(data.repeatedCount),
    createdAt: dateValue(data.createdAt),
    metadata: metadataValue(data.metadata),
    auditLogId: optionalStringValue(data.auditLogId),
  };
}

function stringArrayValue(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}
