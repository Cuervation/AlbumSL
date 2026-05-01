import type { Sticker, StickerId } from "@albumsl/domain";
import type { StickerCatalogRepository } from "@albumsl/application";
import { FieldPath, type Firestore, type Transaction } from "firebase-admin/firestore";

import { FirestoreCollections } from "../firestore-paths.js";
import { fromFirestoreStickerDocument } from "../mappers/sticker.mapper.js";
import {
  getFirestoreDocument,
  getFirestoreQuery,
  type FirestoreRepositoryContext,
} from "./firestore-repository-context.js";

const FIRESTORE_IN_QUERY_LIMIT = 30;

export class FirestoreStickerCatalogRepository implements StickerCatalogRepository {
  private readonly context: FirestoreRepositoryContext;

  public constructor(db: Firestore, transaction?: Transaction) {
    this.context = { db, transaction };
  }

  public async count(): Promise<number> {
    const snapshot = await getFirestoreQuery(
      this.context,
      this.context.db.collection(FirestoreCollections.stickers),
    );

    return snapshot.size;
  }

  public async getActiveStickers(): Promise<readonly Sticker[]> {
    const snapshot = await getFirestoreQuery(
      this.context,
      this.context.db
        .collection(FirestoreCollections.stickers)
        .where("active", "==", true)
        .orderBy("sortOrder", "asc"),
    );

    return snapshot.docs.map((document) =>
      fromFirestoreStickerDocument(document.id, document.data()),
    );
  }

  public async getStickerById(stickerId: StickerId): Promise<Sticker | null> {
    const snapshot = await getFirestoreDocument(
      this.context,
      this.context.db.collection(FirestoreCollections.stickers).doc(stickerId),
    );

    if (!snapshot.exists) {
      return null;
    }

    return fromFirestoreStickerDocument(snapshot.id, snapshot.data() ?? {});
  }

  public async getStickersByIds(stickerIds: readonly StickerId[]): Promise<readonly Sticker[]> {
    if (stickerIds.length === 0) {
      return [];
    }

    const chunks = chunk(stickerIds, FIRESTORE_IN_QUERY_LIMIT);
    const snapshots = await Promise.all(
      chunks.map((ids) =>
        getFirestoreQuery(
          this.context,
          this.context.db
            .collection(FirestoreCollections.stickers)
            .where(FieldPath.documentId(), "in", ids),
        ),
      ),
    );

    return snapshots
      .flatMap((snapshot) => snapshot.docs)
      .map((document) => fromFirestoreStickerDocument(document.id, document.data()));
  }

  public async findAll(): Promise<readonly Sticker[]> {
    const snapshot = await getFirestoreQuery(
      this.context,
      this.context.db.collection(FirestoreCollections.stickers).orderBy("sortOrder", "asc"),
    );

    return snapshot.docs.map((document) =>
      fromFirestoreStickerDocument(document.id, document.data()),
    );
  }

  public async findById(stickerId: StickerId): Promise<Sticker | null> {
    return this.getStickerById(stickerId);
  }
}

function chunk<T>(items: readonly T[], size: number): readonly (readonly T[])[] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}
