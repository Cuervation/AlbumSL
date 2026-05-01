import type { PackOpenRepositories, TransactionRunner } from "@albumsl/application";
import type { Firestore } from "firebase-admin/firestore";

import { FirestoreAuditLogRepository } from "./firestore-audit-log.repository.js";
import { FirestorePackClaimRepository } from "./firestore-pack-claim.repository.js";
import { FirestorePackOpeningRepository } from "./firestore-pack-opening.repository.js";
import { FirestoreStickerCatalogRepository } from "./firestore-sticker-catalog.repository.js";
import { FirestoreUserAlbumRepository } from "./firestore-user-album.repository.js";
import { FirestoreUserStickerRepository } from "./firestore-user-sticker.repository.js";

export class FirestoreTransactionRunner implements TransactionRunner {
  public constructor(private readonly db: Firestore) {}

  public async run<T>(work: (repositories: PackOpenRepositories) => Promise<T>): Promise<T> {
    return this.db.runTransaction(async (transaction) =>
      work({
        stickerCatalogRepository: new FirestoreStickerCatalogRepository(this.db, transaction),
        userStickerRepository: new FirestoreUserStickerRepository(this.db, transaction),
        packClaimRepository: new FirestorePackClaimRepository(this.db, transaction),
        packOpeningRepository: new FirestorePackOpeningRepository(this.db, transaction),
        userAlbumRepository: new FirestoreUserAlbumRepository(this.db, transaction),
        auditLogRepository: new FirestoreAuditLogRepository(this.db, transaction),
      }),
    );
  }
}
