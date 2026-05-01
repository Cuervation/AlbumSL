import type { PackClaim, PackSource } from "@albumsl/domain";
import type { PackClaimRepository } from "@albumsl/application";
import type { Firestore, Transaction } from "firebase-admin/firestore";

import { FirestoreCollections } from "../firestore-paths.js";
import {
  fromFirestorePackClaimDocument,
  toFirestorePackClaimDocument,
} from "../mappers/pack-claim.mapper.js";
import {
  getFirestoreDocument,
  getFirestoreQuery,
  setFirestoreDocument,
  type FirestoreRepositoryContext,
} from "./firestore-repository-context.js";

export class FirestorePackClaimRepository implements PackClaimRepository {
  private readonly context: FirestoreRepositoryContext;

  public constructor(db: Firestore, transaction?: Transaction) {
    this.context = { db, transaction };
  }

  public async findById(claimId: string): Promise<PackClaim | null> {
    const snapshot = await getFirestoreDocument(this.context, this.claimDocument(claimId));

    if (!snapshot.exists) {
      return null;
    }

    return fromFirestorePackClaimDocument(snapshot.id, snapshot.data() ?? {});
  }

  public async findLatestByUserAndSource(
    userId: string,
    source: PackSource,
  ): Promise<PackClaim | null> {
    const snapshot = await getFirestoreQuery(
      this.context,
      this.context.db
        .collection(FirestoreCollections.packClaims)
        .where("userId", "==", userId)
        .where("source", "==", source)
        .orderBy("createdAt", "desc")
        .limit(1),
    );
    const document = snapshot.docs[0];

    return document ? fromFirestorePackClaimDocument(document.id, document.data()) : null;
  }

  public async save(packClaim: PackClaim): Promise<PackClaim> {
    await setFirestoreDocument(
      this.context,
      this.claimDocument(packClaim.id),
      toFirestorePackClaimDocument(packClaim),
    );

    return packClaim;
  }

  private claimDocument(claimId: string): FirebaseFirestore.DocumentReference {
    return this.context.db.collection(FirestoreCollections.packClaims).doc(claimId);
  }
}
