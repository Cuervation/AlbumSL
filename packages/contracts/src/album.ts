import type { UserStickerDto } from "./stickers";

export interface AlbumProgressDto {
  readonly totalStickers: number;
  readonly collectedStickers: number;
  readonly pastedStickers: number;
  readonly repeatedStickers: number;
  readonly completionPercentage: number;
}

export interface PasteStickerRequestDto {
  readonly stickerId: string;
}

export interface PasteStickerResponseDto {
  readonly userSticker: UserStickerDto;
  readonly progress: AlbumProgressDto;
}
