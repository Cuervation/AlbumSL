import type { Firestore, Transaction } from "firebase-admin/firestore";

export interface FirestoreRepositoryContext {
  readonly db: Firestore;
  readonly transaction?: Transaction;
}

export async function getFirestoreDocument(
  context: FirestoreRepositoryContext,
  ref: FirebaseFirestore.DocumentReference,
): Promise<FirebaseFirestore.DocumentSnapshot> {
  return context.transaction ? context.transaction.get(ref) : ref.get();
}

export async function getFirestoreQuery(
  context: FirestoreRepositoryContext,
  query: FirebaseFirestore.Query,
): Promise<FirebaseFirestore.QuerySnapshot> {
  return context.transaction ? context.transaction.get(query) : query.get();
}

export async function setFirestoreDocument(
  context: FirestoreRepositoryContext,
  ref: FirebaseFirestore.DocumentReference,
  data: FirebaseFirestore.DocumentData,
  options: FirebaseFirestore.SetOptions = { merge: true },
): Promise<void> {
  if (context.transaction) {
    context.transaction.set(ref, data, options);
    return;
  }

  await ref.set(data, options);
}
