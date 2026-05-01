import { calculateAlbumProgress, type AlbumProgress } from "@albumsl/domain";

import type { StickerCatalogRepository, UserStickerRepository } from "../ports";

export interface CalculateAlbumProgressInput {
  readonly userId: string;
}

export interface CalculateAlbumProgressDependencies {
  readonly stickerCatalogRepository: Pick<StickerCatalogRepository, "count">;
  readonly userStickerRepository: Pick<UserStickerRepository, "findByUserId">;
}

export async function calculateAlbumProgressUseCase(
  input: CalculateAlbumProgressInput,
  dependencies: CalculateAlbumProgressDependencies,
): Promise<AlbumProgress> {
  const [totalStickers, userStickers] = await Promise.all([
    dependencies.stickerCatalogRepository.count(),
    dependencies.userStickerRepository.findByUserId(input.userId),
  ]);

  return calculateAlbumProgress(userStickers, totalStickers);
}
