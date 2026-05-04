import type { Clock, IdGenerator, RandomGenerator } from "@albumsl/application";
import { FirestorePackClaimRepository } from "@albumsl/infra-firebase";
import { FirestoreTransactionRunner } from "@albumsl/infra-firebase";
import { randomInt, randomUUID, webcrypto } from "node:crypto";
import { getFirestore } from "firebase-admin/firestore";

import { getOrCreateFirebaseApp } from "./firebase-auth.js";

function getDb() {
  return getFirestore(getOrCreateFirebaseApp());
}

export function createApiDependencies() {
  const db = getDb();

  return {
    packClaimRepository: new FirestorePackClaimRepository(db),
    transactionRunner: new FirestoreTransactionRunner(db),
    clock: createSystemClock(),
    idGenerator: createRandomIdGenerator(),
    randomGenerator: createCryptoRandomGenerator(),
  };
}

function createSystemClock(): Clock {
  return {
    now: () => new Date(),
  };
}

function createRandomIdGenerator(): IdGenerator {
  return {
    nextId: (prefix = "id") => `${prefix}_${randomUUID()}`,
  };
}

function createCryptoRandomGenerator(): RandomGenerator {
  return {
    nextFloat: () => {
      const randomValues = new Uint32Array(1);
      webcrypto.getRandomValues(randomValues);
      const randomValue = randomValues[0] ?? 0;

      return randomValue / 2 ** 32;
    },
    nextInt: (minInclusive, maxExclusive) => randomInt(minInclusive, maxExclusive),
  };
}
