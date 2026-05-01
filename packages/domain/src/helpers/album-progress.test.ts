import { describe, expect, it } from "vitest";

import type { UserSticker } from "../entities";
import {
  calculateAlbumProgress,
  countCollectedStickers,
  countPastedStickers,
  countRepeatedStickers,
} from "./album-progress";

const stickers: readonly UserSticker[] = [
  { stickerId: "sticker-1", quantity: 0, pastedQuantity: 0 },
  { stickerId: "sticker-2", quantity: 1, pastedQuantity: 0 },
  { stickerId: "sticker-3", quantity: 2, pastedQuantity: 1 },
  { stickerId: "sticker-4", quantity: 3, pastedQuantity: 3 },
];

describe("album progress helpers", () => {
  it("counts collected, pasted and repeated stickers", () => {
    expect(countCollectedStickers(stickers)).toBe(3);
    expect(countPastedStickers(stickers)).toBe(2);
    expect(countRepeatedStickers(stickers)).toBe(2);
  });

  it("calculates progress from unique pasted stickers", () => {
    expect(calculateAlbumProgress(stickers, 4)).toEqual({
      totalStickers: 4,
      collectedStickers: 3,
      pastedStickers: 2,
      repeatedStickers: 2,
      completionPercentage: 50,
    });
  });

  it("handles totalStickers 0 and empty collections", () => {
    expect(calculateAlbumProgress([], 0)).toEqual({
      totalStickers: 0,
      collectedStickers: 0,
      pastedStickers: 0,
      repeatedStickers: 0,
      completionPercentage: 0,
    });
  });
});
