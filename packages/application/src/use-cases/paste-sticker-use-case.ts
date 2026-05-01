import {
  canPasteSticker,
  pasteSticker,
  type StickerId,
  type UserSticker,
  validateUserSticker,
} from "@albumsl/domain";

import { ApplicationError } from "../errors";
import type { UserStickerRepository } from "../ports";

export interface PasteStickerInput {
  readonly userId: string;
  readonly stickerId: StickerId;
}

export interface PasteStickerDependencies {
  readonly userStickerRepository: Pick<UserStickerRepository, "findByUserIdAndStickerId" | "save">;
}

export async function pasteStickerUseCase(
  input: PasteStickerInput,
  dependencies: PasteStickerDependencies,
): Promise<UserSticker> {
  const userSticker = await dependencies.userStickerRepository.findByUserIdAndStickerId(
    input.userId,
    input.stickerId,
  );

  if (!userSticker) {
    throw new ApplicationError("STICKER_NOT_FOUND", "Sticker was not found in user collection");
  }

  const validation = validateUserSticker(userSticker);

  if (!validation.isValid) {
    throw new ApplicationError("INVALID_ARGUMENT", "User sticker is invalid", validation.errors);
  }

  if (!canPasteSticker(userSticker)) {
    throw new ApplicationError(
      "INSUFFICIENT_QUANTITY",
      "User does not have an available sticker to paste",
    );
  }

  const updatedUserSticker = pasteSticker(userSticker);

  return dependencies.userStickerRepository.save(input.userId, updatedUserSticker);
}
