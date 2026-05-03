import type { Clock } from "@albumsl/application";
import { FirestorePackClaimRepository } from "@albumsl/infra-firebase";
import { getFirestore } from "firebase-admin/firestore";

import { getOrCreateFirebaseApp } from "./firebase-auth.js";

function getDb() {
  return getFirestore(getOrCreateFirebaseApp());
}

export function createApiDependencies() {
  const db = getDb();

  return {
    packClaimRepository: new FirestorePackClaimRepository(db),
    clock: createSystemClock(),
  };
}

function createSystemClock(): Clock {
  return {
    now: () => new Date(),
  };
}
