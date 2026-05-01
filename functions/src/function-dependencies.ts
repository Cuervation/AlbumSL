import { randomUUID } from "node:crypto";

import type { Clock, IdGenerator, RandomGenerator } from "@albumsl/application";
import { FirestoreTransactionRunner } from "@albumsl/infra-firebase";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { FirestorePackClaimRepository } from "@albumsl/infra-firebase";

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
    randomGenerator: createMathRandomGenerator(),
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

function createMathRandomGenerator(): RandomGenerator {
  return {
    nextFloat: () => Math.random(),
    nextInt: (minInclusive, maxExclusive) =>
      Math.floor(Math.random() * (maxExclusive - minInclusive)) + minInclusive,
  };
}
