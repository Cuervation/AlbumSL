import { describe, expect, it } from "vitest";

import type { UserSticker } from "@albumsl/domain";

import type { UserStickerRepository } from "../ports";
import { pasteStickerUseCase } from "./paste-sticker-use-case";

function createRepository(userSticker: UserSticker | null): UserStickerRepository {
  return {
    findByUserId: async () => (userSticker ? [userSticker] : []),
    findByUserIdAndStickerId: async () => userSticker,
    save: async (_userId, updatedUserSticker) => updatedUserSticker,
    saveMany: async (_userId, userStickers) => userStickers,
  };
}

describe("pasteStickerUseCase", () => {
  it("pastes an available sticker and saves it", async () => {
    const result = await pasteStickerUseCase(
      { userId: "user-1", stickerId: "sticker-1" },
      {
        userStickerRepository: createRepository({
          stickerId: "sticker-1",
          quantity: 1,
          pastedQuantity: 0,
        }),
      },
    );

    expect(result).toEqual({
      stickerId: "sticker-1",
      quantity: 1,
      pastedQuantity: 1,
    });
  });

  it("fails when the sticker is not in the user collection", async () => {
    await expect(
      pasteStickerUseCase(
        { userId: "user-1", stickerId: "missing" },
        { userStickerRepository: createRepository(null) },
      ),
    ).rejects.toMatchObject({
      code: "STICKER_NOT_FOUND",
    });
  });

  it("fails when there is no available quantity to paste", async () => {
    await expect(
      pasteStickerUseCase(
        { userId: "user-1", stickerId: "sticker-1" },
        {
          userStickerRepository: createRepository({
            stickerId: "sticker-1",
            quantity: 1,
            pastedQuantity: 1,
          }),
        },
      ),
    ).rejects.toMatchObject({
      code: "INSUFFICIENT_QUANTITY",
    });
  });

  it("fails when the user sticker state is invalid", async () => {
    await expect(
      pasteStickerUseCase(
        { userId: "user-1", stickerId: "sticker-1" },
        {
          userStickerRepository: createRepository({
            stickerId: "sticker-1",
            quantity: 1,
            pastedQuantity: 2,
          }),
        },
      ),
    ).rejects.toMatchObject({
      code: "INVALID_ARGUMENT",
    });
  });
});
