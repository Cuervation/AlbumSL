import type { UserSticker } from "../entities.js";
import { DomainValidationError, type DomainValidationResult } from "../errors.js";

export function validateUserSticker(userSticker: UserSticker): DomainValidationResult {
  const errors: string[] = [];

  if (!Number.isInteger(userSticker.quantity)) {
    errors.push("quantity must be an integer");
  }

  if (userSticker.quantity < 0) {
    errors.push("quantity must be greater than or equal to 0");
  }

  if (!Number.isInteger(userSticker.pastedQuantity)) {
    errors.push("pastedQuantity must be an integer");
  }

  if (userSticker.pastedQuantity < 0) {
    errors.push("pastedQuantity must be greater than or equal to 0");
  }

  if (userSticker.pastedQuantity > userSticker.quantity) {
    errors.push("pastedQuantity cannot be greater than quantity");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function isStickerCollected(userSticker: UserSticker): boolean {
  return userSticker.quantity > 0;
}

export function isStickerPasted(userSticker: UserSticker): boolean {
  return userSticker.pastedQuantity > 0;
}

export function getRepeatedQuantity(userSticker: UserSticker): number {
  return Math.max(userSticker.quantity - userSticker.pastedQuantity, 0);
}

export function canPasteSticker(userSticker: UserSticker): boolean {
  return validateUserSticker(userSticker).isValid && getRepeatedQuantity(userSticker) > 0;
}

export function pasteSticker(userSticker: UserSticker): UserSticker {
  const validation = validateUserSticker(userSticker);

  if (!validation.isValid) {
    throw new DomainValidationError("Invalid user sticker", validation.errors);
  }

  if (!canPasteSticker(userSticker)) {
    throw new DomainValidationError("Sticker cannot be pasted", [
      "quantity must be greater than pastedQuantity",
    ]);
  }

  return {
    ...userSticker,
    pastedQuantity: userSticker.pastedQuantity + 1,
  };
}
