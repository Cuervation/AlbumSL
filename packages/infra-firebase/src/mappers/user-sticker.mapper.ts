import type { UserSticker } from "@albumsl/domain";

import { optionalDateValue, stringValue } from "./firestore-value.mapper.js";

export interface FirestoreUserStickerDocument {
  readonly stickerId: string;
  readonly userId: string;
  readonly quantity: number;
  readonly pastedQuantity: number;
  readonly firstCollectedAt?: Date;
  readonly lastCollectedAt?: Date;
  readonly updatedAt?: Date;
}

export function toFirestoreUserStickerDocument(
  userId: string,
  userSticker: UserSticker,
): FirestoreUserStickerDocument {
  return {
    stickerId: userSticker.stickerId,
    userId,
    quantity: userSticker.quantity,
    pastedQuantity: userSticker.pastedQuantity,
    firstCollectedAt: userSticker.firstCollectedAt ?? userSticker.acquiredAt,
    lastCollectedAt: userSticker.lastCollectedAt,
    updatedAt: userSticker.updatedAt,
  };
}

export function fromFirestoreUserStickerDocument(
  stickerId: string,
  data: FirebaseFirestore.DocumentData,
): UserSticker {
  return {
    stickerId: stringValue(data.stickerId, stickerId),
    quantity: numberValue(data.quantity),
    pastedQuantity: numberValue(data.pastedQuantity),
    firstCollectedAt: optionalDateValue(data.firstCollectedAt),
    lastCollectedAt: optionalDateValue(data.lastCollectedAt),
    updatedAt: optionalDateValue(data.updatedAt),
  };
}

function numberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}
