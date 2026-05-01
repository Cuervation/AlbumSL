import { describe, expect, it } from "vitest";

import type { UserSticker } from "../entities";
import {
  canPasteSticker,
  getRepeatedQuantity,
  isStickerCollected,
  isStickerPasted,
  pasteSticker,
  validateUserSticker,
} from "./user-stickers";

function userSticker(quantity: number, pastedQuantity: number): UserSticker {
  return {
    stickerId: "sticker-1",
    quantity,
    pastedQuantity,
  };
}

describe("user sticker helpers", () => {
  it("detects collected stickers by quantity", () => {
    expect(isStickerCollected(userSticker(0, 0))).toBe(false);
    expect(isStickerCollected(userSticker(1, 0))).toBe(true);
  });

  it("detects pasted stickers by pasted quantity", () => {
    expect(isStickerPasted(userSticker(1, 0))).toBe(false);
    expect(isStickerPasted(userSticker(1, 1))).toBe(true);
  });

  it("calculates repeated quantity without returning negative values", () => {
    expect(getRepeatedQuantity(userSticker(0, 0))).toBe(0);
    expect(getRepeatedQuantity(userSticker(1, 0))).toBe(1);
    expect(getRepeatedQuantity(userSticker(1, 1))).toBe(0);
    expect(getRepeatedQuantity(userSticker(1, 2))).toBe(0);
  });

  it("allows pasting only when there is unpasted quantity", () => {
    expect(canPasteSticker(userSticker(0, 0))).toBe(false);
    expect(canPasteSticker(userSticker(1, 0))).toBe(true);
    expect(canPasteSticker(userSticker(1, 1))).toBe(false);
  });

  it("pastes one sticker at a time", () => {
    expect(pasteSticker(userSticker(1, 0))).toEqual({
      stickerId: "sticker-1",
      quantity: 1,
      pastedQuantity: 1,
    });
  });

  it("fails validation when pasted quantity is greater than quantity", () => {
    const validation = validateUserSticker(userSticker(1, 2));

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain("pastedQuantity cannot be greater than quantity");
    expect(() => pasteSticker(userSticker(1, 2))).toThrow("Invalid user sticker");
  });
});
