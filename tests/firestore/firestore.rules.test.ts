import { readFileSync } from "node:fs";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  deleteDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

const PROJECT_ID = "albumsl-test";
const RULES_PATH = "firestore.rules";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(RULES_PATH, "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await seedFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("firestore.rules users/{userId}", () => {
  it("allows an authenticated user to read their own profile", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(getDoc(doc(db, "users/user-a")));
  });

  it("allows an authenticated user to create a valid own USER profile", async () => {
    const db = testEnv.authenticatedContext("user-new").firestore();

    await assertSucceeds(
      setDoc(doc(db, "users/user-new"), {
        uid: "user-new",
        displayName: "Usuario Nuevo",
        email: "user-new@example.test",
        photoURL: null,
        role: "USER",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies creating own profile with ADMIN role", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(
      setDoc(doc(db, "users/user-a"), {
        uid: "user-a",
        role: "ADMIN",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies reading another user profile", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(getDoc(doc(db, "users/user-b")));
  });

  it("denies unauthenticated users from reading profiles", async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(db, "users/user-a")));
  });

  it("allows updating only safe own profile fields", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(
      updateDoc(doc(db, "users/user-a"), {
        displayName: "Nuevo nombre",
        photoURL: "https://example.test/photo.png",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies changing own role", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(updateDoc(doc(db, "users/user-a"), { role: "ADMIN" }));
  });

  it("allows admin custom claim to read profiles", async () => {
    const db = testEnv.authenticatedContext("admin-a", { admin: true }).firestore();

    await assertSucceeds(getDoc(doc(db, "users/user-a")));
  });
});

describe("firestore.rules stickers/{stickerId}", () => {
  it("allows authenticated users to read active stickers", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(getDoc(doc(db, "stickers/sticker-active")));
  });

  it("allows the catalog query for active stickers", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(
      getDocs(
        query(collection(db, "stickers"), where("active", "==", true), orderBy("sortOrder", "asc")),
      ),
    );
  });

  it("denies authenticated users from reading inactive stickers", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(getDoc(doc(db, "stickers/sticker-inactive")));
  });

  it("denies listing stickers without the active filter", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(getDocs(collection(db, "stickers")));
  });

  it("denies unauthenticated users from reading stickers", async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(db, "stickers/sticker-active")));
  });

  it("denies client create, update and delete", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();
    const stickerRef = doc(db, "stickers/sticker-active");

    await assertFails(setDoc(doc(db, "stickers/sticker-new"), activeSticker("sticker-new")));
    await assertFails(updateDoc(stickerRef, { title: "Editada" }));
    await assertFails(deleteDoc(stickerRef));
  });

  it("allows admin custom claim to read inactive stickers", async () => {
    const db = testEnv.authenticatedContext("admin-a", { admin: true }).firestore();

    await assertSucceeds(getDoc(doc(db, "stickers/sticker-inactive")));
  });
});

describe("firestore.rules userAlbums/{userId}", () => {
  it("allows users to read own summary", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(getDoc(doc(db, "userAlbums/user-a")));
  });

  it("denies users from reading another summary", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(getDoc(doc(db, "userAlbums/user-b")));
  });

  it("denies unauthenticated users from reading summaries", async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(db, "userAlbums/user-a")));
  });

  it("denies client writes", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();
    const albumRef = doc(db, "userAlbums/user-a");

    await assertFails(setDoc(albumRef, albumSummary("user-a")));
    await assertFails(updateDoc(albumRef, { pastedCount: 99 }));
    await assertFails(deleteDoc(albumRef));
  });

  it("allows admin custom claim to read summaries", async () => {
    const db = testEnv.authenticatedContext("admin-a", { admin: true }).firestore();

    await assertSucceeds(getDoc(doc(db, "userAlbums/user-a")));
  });
});

describe("firestore.rules userStickers/{userId}/items/{stickerId}", () => {
  it("allows users to read own stickers", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(getDoc(doc(db, "userStickers/user-a/items/sticker-active")));
  });

  it("allows users to list their own sticker inventory", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(getDocs(collection(db, "userStickers/user-a/items")));
  });

  it("denies users from reading another user's stickers", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(getDoc(doc(db, "userStickers/user-b/items/sticker-active")));
  });

  it("denies users from listing another user's sticker inventory", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(getDocs(collection(db, "userStickers/user-b/items")));
  });

  it("denies unauthenticated users from reading sticker inventory", async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(db, "userStickers/user-a/items/sticker-active")));
  });

  it("denies client create, update and delete", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();
    const userStickerRef = doc(db, "userStickers/user-a/items/sticker-active");

    await assertFails(setDoc(doc(db, "userStickers/user-a/items/sticker-new"), userSticker()));
    await assertFails(updateDoc(userStickerRef, { quantity: 99 }));
    await assertFails(deleteDoc(userStickerRef));
  });

  it("allows admin custom claim to read user stickers", async () => {
    const db = testEnv.authenticatedContext("admin-a", { admin: true }).firestore();

    await assertSucceeds(getDoc(doc(db, "userStickers/user-a/items/sticker-active")));
  });
});

describe("firestore.rules packClaims/{claimId}", () => {
  it("allows users to read own claims", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(getDoc(doc(db, "packClaims/claim-a")));
  });

  it("allows users to query own claims", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(
      getDocs(query(collection(db, "packClaims"), where("userId", "==", "user-a"))),
    );
  });

  it("denies users from reading another user's claims", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(getDoc(doc(db, "packClaims/claim-b")));
  });

  it("denies users from querying another user's claims", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(
      getDocs(query(collection(db, "packClaims"), where("userId", "==", "user-b"))),
    );
  });

  it("denies unauthenticated users from reading claims", async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(db, "packClaims/claim-a")));
  });

  it("denies client create, update and delete", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();
    const claimRef = doc(db, "packClaims/claim-a");

    await assertFails(setDoc(doc(db, "packClaims/claim-new"), packClaim("claim-new", "user-a")));
    await assertFails(updateDoc(claimRef, { status: "CONSUMED" }));
    await assertFails(deleteDoc(claimRef));
  });

  it("allows admin custom claim to read claims", async () => {
    const db = testEnv.authenticatedContext("admin-a", { admin: true }).firestore();

    await assertSucceeds(getDoc(doc(db, "packClaims/claim-a")));
  });
});

describe("firestore.rules packOpenings/{openingId}", () => {
  it("allows users to read own openings", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(getDoc(doc(db, "packOpenings/opening-a")));
  });

  it("allows the album query for own recent openings", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(
      getDocs(
        query(
          collection(db, "packOpenings"),
          where("userId", "==", "user-a"),
          orderBy("createdAt", "desc"),
          limit(5),
        ),
      ),
    );
  });

  it("denies users from reading another user's openings", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(getDoc(doc(db, "packOpenings/opening-b")));
  });

  it("denies users from querying another user's openings", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(
      getDocs(query(collection(db, "packOpenings"), where("userId", "==", "user-b"))),
    );
  });

  it("denies unauthenticated users from reading openings", async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(db, "packOpenings/opening-a")));
  });

  it("denies client create, update and delete", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();
    const openingRef = doc(db, "packOpenings/opening-a");

    await assertFails(
      setDoc(doc(db, "packOpenings/opening-new"), packOpening("opening-new", "user-a")),
    );
    await assertFails(updateDoc(openingRef, { repeatedCount: 99 }));
    await assertFails(deleteDoc(openingRef));
  });

  it("allows admin custom claim to read openings", async () => {
    const db = testEnv.authenticatedContext("admin-a", { admin: true }).firestore();

    await assertSucceeds(getDoc(doc(db, "packOpenings/opening-a")));
  });
});

describe("firestore.rules stadiumEvents/{eventId}", () => {
  it("allows authenticated users to read active stadium events", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(getDoc(doc(db, "stadiumEvents/event-active")));
  });

  it("denies authenticated users from reading inactive stadium events", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(getDoc(doc(db, "stadiumEvents/event-inactive")));
  });

  it("denies client writes", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(setDoc(doc(db, "stadiumEvents/event-new"), stadiumEvent("event-new")));
    await assertFails(updateDoc(doc(db, "stadiumEvents/event-active"), { active: false }));
    await assertFails(deleteDoc(doc(db, "stadiumEvents/event-active")));
  });

  it("allows admin custom claim to read inactive stadium events", async () => {
    const db = testEnv.authenticatedContext("admin-a", { admin: true }).firestore();

    await assertSucceeds(getDoc(doc(db, "stadiumEvents/event-inactive")));
  });
});

describe("firestore.rules auditLogs/{auditLogId}", () => {
  it("denies normal users from reading audit logs", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(getDoc(doc(db, "auditLogs/audit-a")));
  });

  it("denies normal users from writing audit logs", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(setDoc(doc(db, "auditLogs/audit-new"), auditLog("audit-new")));
  });

  it("allows admin custom claim to read audit logs", async () => {
    const db = testEnv.authenticatedContext("admin-a", { admin: true }).firestore();

    await assertSucceeds(getDoc(doc(db, "auditLogs/audit-a")));
  });

  it("denies admin client writes to audit logs", async () => {
    const db = testEnv.authenticatedContext("admin-a", { admin: true }).firestore();

    await assertFails(setDoc(doc(db, "auditLogs/audit-new"), auditLog("audit-new")));
  });
});

describe("firestore.rules system/config", () => {
  it("allows authenticated users to read system config", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertSucceeds(getDoc(doc(db, "system/config")));
  });

  it("denies authenticated users from writing system config", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(updateDoc(doc(db, "system/config"), { packSize: 10 }));
  });

  it("denies unauthenticated users from reading system config", async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(db, "system/config")));
  });
});

describe("firestore.rules default deny", () => {
  it("denies reads and writes on unmodeled paths", async () => {
    const db = testEnv.authenticatedContext("user-a").firestore();

    await assertFails(getDoc(doc(db, "unknown/path")));
    await assertFails(setDoc(doc(db, "unknown/path"), { value: true }));
  });
});

async function seedFirestore(): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await Promise.all([
      setDoc(doc(db, "users/user-a"), userProfile("user-a")),
      setDoc(doc(db, "users/user-b"), userProfile("user-b")),
      setDoc(doc(db, "stickers/sticker-active"), activeSticker("sticker-active")),
      setDoc(doc(db, "stickers/sticker-inactive"), {
        ...activeSticker("sticker-inactive"),
        active: false,
      }),
      setDoc(doc(db, "userAlbums/user-a"), albumSummary("user-a")),
      setDoc(doc(db, "userAlbums/user-b"), albumSummary("user-b")),
      setDoc(doc(db, "userStickers/user-a/items/sticker-active"), userSticker("user-a")),
      setDoc(doc(db, "userStickers/user-b/items/sticker-active"), userSticker("user-b")),
      setDoc(doc(db, "packClaims/claim-a"), packClaim("claim-a", "user-a")),
      setDoc(doc(db, "packClaims/claim-b"), packClaim("claim-b", "user-b")),
      setDoc(doc(db, "packOpenings/opening-a"), packOpening("opening-a", "user-a")),
      setDoc(doc(db, "packOpenings/opening-b"), packOpening("opening-b", "user-b")),
      setDoc(doc(db, "stadiumEvents/event-active"), stadiumEvent("event-active")),
      setDoc(doc(db, "stadiumEvents/event-inactive"), {
        ...stadiumEvent("event-inactive"),
        active: false,
      }),
      setDoc(doc(db, "auditLogs/audit-a"), auditLog("audit-a")),
      setDoc(doc(db, "system/config"), {
        packSize: 5,
        dailyPackEnabled: true,
        stadiumPackEnabled: false,
        rarityWeights: {
          COMMON: 70,
          UNCOMMON: 20,
          RARE: 7,
          EPIC: 2,
          LEGENDARY: 1,
        },
        updatedAt: testTimestamp(),
      }),
    ]);
  });
}

function userProfile(uid: string) {
  return {
    uid,
    displayName: `User ${uid}`,
    email: `${uid}@example.test`,
    photoURL: null,
    role: "USER",
    createdAt: testTimestamp(),
    updatedAt: testTimestamp(),
  };
}

function activeSticker(id: string) {
  return {
    id,
    number: 1,
    title: "Sticker test",
    description: "Sticker de prueba",
    category: "PLAYER",
    era: "POST_1990",
    rarity: "COMMON",
    imageUrl: "/placeholders/sticker.svg",
    tags: ["test"],
    sortOrder: 1,
    active: true,
    createdAt: testTimestamp(),
    updatedAt: testTimestamp(),
  };
}

function albumSummary(userId: string) {
  return {
    userId,
    totalStickers: 600,
    collectedCount: 1,
    pastedCount: 0,
    repeatedCount: 0,
    completionPercentage: 0,
    createdAt: testTimestamp(),
    updatedAt: testTimestamp(),
  };
}

function userSticker(userId = "user-a") {
  return {
    stickerId: "sticker-active",
    userId,
    quantity: 1,
    pastedQuantity: 0,
    firstCollectedAt: testTimestamp(),
    lastCollectedAt: testTimestamp(),
    updatedAt: testTimestamp(),
  };
}

function packClaim(id: string, userId: string) {
  return {
    id,
    userId,
    source: "DAILY",
    status: "AVAILABLE",
    eventId: null,
    createdAt: testTimestamp(),
    expiresAt: testTimestamp(),
    consumedAt: null,
    updatedAt: testTimestamp(),
    metadata: {},
  };
}

function packOpening(id: string, userId: string) {
  return {
    id,
    userId,
    source: "DAILY",
    claimId: `claim-${userId}`,
    stickerIds: ["sticker-active"],
    newCount: 1,
    repeatedCount: 0,
    createdAt: testTimestamp(),
    metadata: {},
  };
}

function stadiumEvent(id: string) {
  return {
    id,
    name: "Evento test",
    active: true,
    startsAt: testTimestamp(),
    endsAt: testTimestamp(),
    latitude: -34.6356,
    longitude: -58.4173,
    radiusMeters: 300,
    createdAt: testTimestamp(),
    updatedAt: testTimestamp(),
  };
}

function auditLog(id: string) {
  return {
    id,
    actorUserId: "user-a",
    action: "PACK_OPENED",
    entityType: "packOpening",
    entityId: "opening-a",
    createdAt: testTimestamp(),
    metadata: {},
    severity: "INFO",
  };
}

function testTimestamp(): Timestamp {
  return Timestamp.fromDate(new Date("2026-05-02T00:00:00.000Z"));
}
