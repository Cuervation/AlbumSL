import type { PackOpening } from "@albumsl/domain";
import type { PackOpeningRepository } from "@albumsl/application";
import type { Firestore, Transaction } from "firebase-admin/firestore";

import { FirestoreCollections } from "../firestore-paths.js";
import {
  fromFirestorePackOpeningDocument,
  toFirestorePackOpeningDocument,
} from "../mappers/pack-opening.mapper.js";
import {
  getFirestoreDocument,
  setFirestoreDocument,
  type FirestoreRepositoryContext,
} from "./firestore-repository-context.js";

export class FirestorePackOpeningRepository implements PackOpeningRepository {
  private readonly context: FirestoreRepositoryContext;

  public constructor(db: Firestore, transaction?: Transaction) {
    this.context = { db, transaction };
  }

  public async findById(packOpeningId: string): Promise<PackOpening | null> {
    const snapshot = await getFirestoreDocument(this.context, this.openingDocument(packOpeningId));

    if (!snapshot.exists) {
      return null;
    }

    return fromFirestorePackOpeningDocument(snapshot.id, snapshot.data() ?? {});
  }

  public async save(packOpening: PackOpening): Promise<PackOpening> {
    await setFirestoreDocument(
      this.context,
      this.openingDocument(packOpening.id),
      toFirestorePackOpeningDocument(packOpening),
    );

    return packOpening;
  }

  private openingDocument(openingId: string): FirebaseFirestore.DocumentReference {
    return this.context.db.collection(FirestoreCollections.packOpenings).doc(openingId);
  }
}
