import type { AlbumStickerView, UserSticker } from "@albumsl/domain";
import { describe, expect, it } from "vitest";

import { getExchangeableQuantity, isExchangeableSticker } from "./sticker-library-model";

describe("sticker library exchange view model", () => {
  it("reserves the only unpasted copy for the album", () => {
    const albumSticker = createAlbumSticker({ quantity: 1, pastedQuantity: 0 });

    expect(getExchangeableQuantity(albumSticker)).toBe(0);
    expect(isExchangeableSticker(albumSticker)).toBe(false);
  });

  it("allows copies beyond the one reserved for the album", () => {
    expect(getExchangeableQuantity(createAlbumSticker({ quantity: 3, pastedQuantity: 0 }))).toBe(2);
    expect(getExchangeableQuantity(createAlbumSticker({ quantity: 3, pastedQuantity: 1 }))).toBe(2);
  });

  it("never returns a negative quantity for inconsistent input", () => {
    expect(getExchangeableQuantity(createAlbumSticker({ quantity: 1, pastedQuantity: 2 }))).toBe(0);
  });
});

function createAlbumSticker(
  userSticker: Pick<UserSticker, "quantity" | "pastedQuantity">,
): AlbumStickerView {
  return {
    sticker: {
      id: "sticker-1",
      number: 1,
      title: "Sticker",
      description: "",
      category: "PLAYER",
      era: "POST_1990",
      rarity: "COMMON",
      imageUrl: "placeholder://sticker",
      tags: [],
      sortOrder: 1,
      active: true,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    },
    userSticker: {
      ...userSticker,
      stickerId: "sticker-1",
    },
    isCollected: userSticker.quantity > 0,
    isPasted: userSticker.pastedQuantity > 0,
    placementState: getPlacementState(userSticker),
    duplicateQuantity: Math.max(userSticker.quantity - 1, 0),
    repeatedQuantity: Math.max(userSticker.quantity - 1, 0),
    status: userSticker.pastedQuantity > 0 ? "PASTED" : "COLLECTED",
  };
}

function getPlacementState(
  userSticker: Pick<UserSticker, "quantity" | "pastedQuantity">,
): AlbumStickerView["placementState"] {
  if (userSticker.quantity === 0) {
    return "MISSING";
  }

  return userSticker.pastedQuantity > 0 ? "PASTED" : "UNPASTED";
}
