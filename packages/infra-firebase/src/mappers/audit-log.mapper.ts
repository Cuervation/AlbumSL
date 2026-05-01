import type { AuditLogEntry } from "@albumsl/application";

export interface FirestoreAuditLogDocument {
  readonly id: string;
  readonly actorUserId: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly createdAt: Date;
  readonly severity: "INFO" | "WARNING" | "ERROR";
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export function toFirestoreAuditLogDocument(entry: AuditLogEntry): FirestoreAuditLogDocument {
  return {
    id: entry.id,
    actorUserId: entry.actorUserId,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    createdAt: entry.createdAt,
    severity: entry.severity,
    metadata: entry.metadata,
  };
}
