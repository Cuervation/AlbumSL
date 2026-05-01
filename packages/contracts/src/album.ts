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
  readonly stickerId: string;
  readonly quantity: number;
  readonly pastedQuantity: number;
  readonly repeatedQuantity: number;
  readonly albumProgress: AlbumProgressDto;
}

export interface UserAlbumSummaryDto {
  readonly userId: string;
  readonly totalStickers: number;
  readonly collectedCount: number;
  readonly pastedCount: number;
  readonly repeatedCount: number;
  readonly completionPercentage: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
