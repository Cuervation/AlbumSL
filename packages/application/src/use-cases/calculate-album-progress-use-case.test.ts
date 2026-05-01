import { describe, expect, it } from "vitest";

import { calculateAlbumProgressUseCase } from "./calculate-album-progress-use-case";

describe("calculateAlbumProgressUseCase", () => {
  it("calculates progress using repositories as ports", async () => {
    const progress = await calculateAlbumProgressUseCase(
      { userId: "user-1" },
      {
        stickerCatalogRepository: {
          count: async () => 4,
        },
        userStickerRepository: {
          findByUserId: async () => [
            { stickerId: "sticker-1", quantity: 1, pastedQuantity: 1 },
            { stickerId: "sticker-2", quantity: 2, pastedQuantity: 0 },
          ],
        },
      },
    );

    expect(progress).toEqual({
      totalStickers: 4,
      collectedStickers: 2,
      pastedStickers: 1,
      repeatedStickers: 2,
      completionPercentage: 25,
    });
  });
});
