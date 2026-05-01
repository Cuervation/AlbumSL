import { randomInt, randomUUID, webcrypto } from "node:crypto";

import type { Clock, IdGenerator, RandomGenerator } from "@albumsl/application";
import { FirestoreTransactionRunner } from "@albumsl/infra-firebase";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { FirestorePackClaimRepository } from "@albumsl/infra-firebase";

import { createFirestoreAdminDashboardDataSource } from "./admin-dashboard-firestore.js";

function getDb() {
  const app = getApps()[0] ?? initializeApp();
  return getFirestore(app);
}

export function createFunctionDependencies() {
  const db = getDb();

  return {
    packClaimRepository: new FirestorePackClaimRepository(db),
    transactionRunner: new FirestoreTransactionRunner(db),
    clock: createSystemClock(),
    idGenerator: createRandomIdGenerator(),
    randomGenerator: createCryptoRandomGenerator(),
    adminDashboardDataSource: createFirestoreAdminDashboardDataSource(db),
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
