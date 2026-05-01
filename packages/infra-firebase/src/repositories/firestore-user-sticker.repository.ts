import type { UserSticker, StickerId } from "@albumsl/domain";
import type { UserStickerRepository } from "@albumsl/application";
import type { Firestore, Transaction } from "firebase-admin/firestore";

import { FirestoreCollections } from "../firestore-paths.js";
import {
  fromFirestoreUserStickerDocument,
  toFirestoreUserStickerDocument,
} from "../mappers/user-sticker.mapper.js";
import {
  getFirestoreDocument,
  getFirestoreQuery,
  setFirestoreDocument,
  type FirestoreRepositoryContext,
} from "./firestore-repository-context.js";

export class FirestoreUserStickerRepository implements UserStickerRepository {
  private readonly context: FirestoreRepositoryContext;

  public constructor(db: Firestore, transaction?: Transaction) {
    this.context = { db, transaction };
  }

  public async findByUserId(userId: string): Promise<readonly UserSticker[]> {
    const snapshot = await getFirestoreQuery(this.context, this.itemsCollection(userId));

    return snapshot.docs.map((document) =>
      fromFirestoreUserStickerDocument(document.id, document.data()),
    );
  }

  public async findByUserIdAndStickerId(
    userId: string,
    stickerId: StickerId,
  ): Promise<UserSticker | null> {
    const snapshot = await getFirestoreDocument(this.context, this.itemDocument(userId, stickerId));

    if (!snapshot.exists) {
      return null;
    }

    return fromFirestoreUserStickerDocument(snapshot.id, snapshot.data() ?? {});
  }

  public async save(userId: string, userSticker: UserSticker): Promise<UserSticker> {
    await setFirestoreDocument(
      this.context,
      this.itemDocument(userId, userSticker.stickerId),
      toFirestoreUserStickerDocument(userId, userSticker),
    );

    return userSticker;
  }

  public async saveMany(
    userId: string,
    userStickers: readonly UserSticker[],
  ): Promise<readonly UserSticker[]> {
    for (const userSticker of userStickers) {
      await this.save(userId, userSticker);
    }

    return userStickers;
  }

  private itemsCollection(userId: string): FirebaseFirestore.CollectionReference {
    return this.context.db
      .collection(FirestoreCollections.userStickers)
      .doc(userId)
      .collection("items");
  }

  private itemDocument(userId: string, stickerId: string): FirebaseFirestore.DocumentReference {
    return this.itemsCollection(userId).doc(stickerId);
  }
}
