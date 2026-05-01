import { ClaimStatus, PackSource, type PackClaim } from "@albumsl/domain";

import {
  enumValue,
  metadataValue,
  optionalDateValue,
  optionalStringValue,
  stringValue,
} from "./firestore-value.mapper.js";

export interface FirestorePackClaimDocument {
  readonly id: string;
  readonly userId: string;
  readonly source: PackSource;
  readonly status: ClaimStatus;
  readonly eventId?: string;
  readonly createdAt: Date;
  readonly expiresAt?: Date;
  readonly consumedAt?: Date;
  readonly updatedAt?: Date;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  readonly packId?: string;
  readonly reason?: string;
}

export function toFirestorePackClaimDocument(packClaim: PackClaim): FirestorePackClaimDocument {
  return {
    id: packClaim.id,
    userId: packClaim.userId,
    source: packClaim.source,
    status: packClaim.status,
    eventId: packClaim.eventId,
    createdAt: packClaim.createdAt,
    expiresAt: packClaim.expiresAt,
    consumedAt: packClaim.consumedAt,
    updatedAt: packClaim.updatedAt,
    metadata: packClaim.metadata ?? {},
    packId: packClaim.packId,
    reason: packClaim.reason,
  };
}

export function fromFirestorePackClaimDocument(
  claimId: string,
  data: FirebaseFirestore.DocumentData,
): PackClaim {
  return {
    id: stringValue(data.id, claimId),
    userId: stringValue(data.userId, ""),
    source: enumValue(PackSource, data.source, PackSource.DAILY),
    status: enumValue(ClaimStatus, data.status, ClaimStatus.PENDING),
    eventId: optionalStringValue(data.eventId),
    createdAt: optionalDateValue(data.createdAt) ?? new Date(0),
    expiresAt: optionalDateValue(data.expiresAt),
    consumedAt: optionalDateValue(data.consumedAt),
    updatedAt: optionalDateValue(data.updatedAt),
    metadata: metadataValue(data.metadata),
    packId: optionalStringValue(data.packId),
    reason: optionalStringValue(data.reason),
  };
}
