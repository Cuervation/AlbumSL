import {
  INITIAL_STICKER_SEED_MIN_EXPECTED,
  initialStickerSeed,
  validateStickerCatalog,
} from "@albumsl/domain";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type DocumentReference } from "firebase-admin/firestore";

import { FirestoreCollections } from "../firestore-paths.js";
import { toFirestoreStickerDocument } from "../mappers/sticker.mapper.js";

interface SeedSummary {
  created: number;
  updated: number;
  omitted: number;
  errors: string[];
}

const dryRun = process.argv.includes("--dry-run");

async function main(): Promise<void> {
  const validation = validateStickerCatalog(initialStickerSeed, {
    minExpectedStickers: INITIAL_STICKER_SEED_MIN_EXPECTED,
  });

  if (!validation.isValid) {
    console.error("Sticker seed validation failed:");
    for (const error of validation.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  const db = getFirestoreApp();
  const summary: SeedSummary = {
    created: 0,
    updated: 0,
    omitted: 0,
    errors: [],
  };

  for (const sticker of initialStickerSeed) {
    const stickerDocument = toFirestoreStickerDocument(sticker);
    const docRef = db.collection(FirestoreCollections.stickers).doc(sticker.id);

    try {
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        if (!dryRun) {
          await docRef.set(stickerDocument);
        }

        summary.created += 1;
        continue;
      }

      if (isExistingStickerUpToDate(snapshot.data() ?? {}, stickerDocument)) {
        summary.omitted += 1;
        continue;
      }

      if (!dryRun) {
        await updateExistingSticker(docRef, stickerDocument);
      }

      summary.updated += 1;
    } catch (error) {
      summary.errors = [...summary.errors, `${sticker.id}: ${getErrorMessage(error)}`];
    }
  }

  printSummary(summary);

  if (summary.errors.length > 0) {
    process.exitCode = 1;
  }
}

function getFirestoreApp() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ?? process.env.GCLOUD_PROJECT ?? "albumsl-local";
  const app = getApps()[0] ?? initializeApp({ projectId });

  return getFirestore(app);
}

async function updateExistingSticker(
  docRef: DocumentReference,
  stickerDocument: ReturnType<typeof toFirestoreStickerDocument>,
): Promise<void> {
  await docRef.update(getUpdatableStickerDocument(stickerDocument));
}

function isExistingStickerUpToDate(
  existingData: FirebaseFirestore.DocumentData,
  stickerDocument: ReturnType<typeof toFirestoreStickerDocument>,
): boolean {
  return (
    stableStringify(normalizeComparable(existingData)) ===
    stableStringify(getUpdatableStickerDocument(stickerDocument))
  );
}

function getUpdatableStickerDocument(
  stickerDocument: ReturnType<typeof toFirestoreStickerDocument>,
): Omit<ReturnType<typeof toFirestoreStickerDocument>, "createdAt"> {
  return {
    active: stickerDocument.active,
    category: stickerDocument.category,
    description: stickerDocument.description,
    era: stickerDocument.era,
    id: stickerDocument.id,
    imageUrl: stickerDocument.imageUrl,
    number: stickerDocument.number,
    rarity: stickerDocument.rarity,
    sortOrder: stickerDocument.sortOrder,
    tags: stickerDocument.tags,
    title: stickerDocument.title,
    updatedAt: stickerDocument.updatedAt,
  };
}

function normalizeComparable(data: FirebaseFirestore.DocumentData): Record<string, unknown> {
  return {
    active: data.active,
    category: data.category,
    description: data.description,
    era: data.era,
    id: data.id,
    imageUrl: data.imageUrl,
    number: data.number,
    rarity: data.rarity,
    sortOrder: data.sortOrder,
    tags: Array.isArray(data.tags) ? data.tags : [],
    title: data.title,
    updatedAt: normalizeDateValue(data.updatedAt),
  };
}

function normalizeDateValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (isTimestampLike(value)) {
    return value.toDate().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function isTimestampLike(value: unknown): value is { toDate: () => Date } {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  );
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, Object.keys(value as Record<string, unknown>).sort());
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}

function printSummary(summary: SeedSummary): void {
  console.info(dryRun ? "Sticker seed dry-run summary" : "Sticker seed summary");
  console.info(`created: ${summary.created}`);
  console.info(`updated: ${summary.updated}`);
  console.info(`omitted: ${summary.omitted}`);
  console.info(`errors: ${summary.errors.length}`);

  for (const error of summary.errors) {
    console.error(`- ${error}`);
  }
}

void main();
