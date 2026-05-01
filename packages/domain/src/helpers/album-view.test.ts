import { describe, expect, it } from "vitest";

import type { Sticker } from "../entities.js";
import { StickerCategory, StickerEra, StickerRarity } from "../enums.js";
import { AlbumStickerStatus, buildAlbumView, getStickerUserStatus } from "./album-view.js";

describe("album view", () => {
  it("marks missing stickers", () => {
    expect(getStickerUserStatus(undefined)).toBe(AlbumStickerStatus.MISSING);
  });

  it("marks collected stickers", () => {
    expect(getStickerUserStatus({ stickerId: "s1", quantity: 1, pastedQuantity: 0 })).toBe(
      AlbumStickerStatus.COLLECTED,
    );
  });

  it("marks pasted stickers", () => {
    expect(getStickerUserStatus({ stickerId: "s1", quantity: 1, pastedQuantity: 1 })).toBe(
      AlbumStickerStatus.PASTED,
    );
  });

  it("marks repeated stickers before pasted status", () => {
    expect(getStickerUserStatus({ stickerId: "s1", quantity: 3, pastedQuantity: 1 })).toBe(
      AlbumStickerStatus.REPEATED,
    );
  });

  it("combines catalog and user stickers ordered by sortOrder", () => {
    const albumView = buildAlbumView(
      [createSticker("s2", 2, 2), createSticker("s1", 1, 1)],
      [{ stickerId: "s1", quantity: 2, pastedQuantity: 1 }],
    );

    expect(albumView.map((slot) => slot.sticker.id)).toEqual(["s1", "s2"]);
    expect(albumView[0]).toMatchObject({
      isCollected: true,
      isPasted: true,
      repeatedQuantity: 1,
      status: AlbumStickerStatus.REPEATED,
    });
    expect(albumView[1]).toMatchObject({
      isCollected: false,
      isPasted: false,
      repeatedQuantity: 0,
      status: AlbumStickerStatus.MISSING,
    });
  });
});

function createSticker(id: string, number: number, sortOrder: number): Sticker {
  return {
    id,
    number,
    title: `Sticker ${number}`,
    description: "Test sticker",
    category: StickerCategory.PLAYER,
    era: StickerEra.POST_1990,
    rarity: StickerRarity.COMMON,
    imageUrl: `placeholder://${id}`,
    tags: [],
    sortOrder,
    active: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}
