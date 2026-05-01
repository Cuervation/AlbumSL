import type { AuditLogEntry, AuditLogRepository } from "@albumsl/application";
import type { Firestore, Transaction } from "firebase-admin/firestore";

import { FirestoreCollections } from "../firestore-paths.js";
import { toFirestoreAuditLogDocument } from "../mappers/audit-log.mapper.js";
import {
  setFirestoreDocument,
  type FirestoreRepositoryContext,
} from "./firestore-repository-context.js";

export class FirestoreAuditLogRepository implements AuditLogRepository {
  private readonly context: FirestoreRepositoryContext;

  public constructor(db: Firestore, transaction?: Transaction) {
    this.context = { db, transaction };
  }

  public async record(entry: AuditLogEntry): Promise<void> {
    await setFirestoreDocument(
      this.context,
      this.context.db.collection(FirestoreCollections.auditLogs).doc(entry.id),
      toFirestoreAuditLogDocument(entry),
    );
  }
}
