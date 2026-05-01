import type { UserAlbumSummary } from "@albumsl/domain";
import type { UserAlbumRepository } from "@albumsl/application";
import type { Firestore, Transaction } from "firebase-admin/firestore";

import { FirestoreCollections } from "../firestore-paths.js";
import {
  fromFirestoreUserAlbumDocument,
  toFirestoreUserAlbumDocument,
} from "../mappers/user-album.mapper.js";
import {
  getFirestoreDocument,
  setFirestoreDocument,
  type FirestoreRepositoryContext,
} from "./firestore-repository-context.js";

export class FirestoreUserAlbumRepository implements UserAlbumRepository {
  private readonly context: FirestoreRepositoryContext;

  public constructor(db: Firestore, transaction?: Transaction) {
    this.context = { db, transaction };
  }

  public async findByUserId(userId: string): Promise<UserAlbumSummary | null> {
    const snapshot = await getFirestoreDocument(this.context, this.albumDocument(userId));

    if (!snapshot.exists) {
      return null;
    }

    return fromFirestoreUserAlbumDocument(snapshot.id, snapshot.data() ?? {});
  }

  public async save(summary: UserAlbumSummary): Promise<UserAlbumSummary> {
    await setFirestoreDocument(
      this.context,
      this.albumDocument(summary.userId),
      toFirestoreUserAlbumDocument(summary),
    );

    return summary;
  }

  private albumDocument(userId: string): FirebaseFirestore.DocumentReference {
    return this.context.db.collection(FirestoreCollections.userAlbums).doc(userId);
  }
}
