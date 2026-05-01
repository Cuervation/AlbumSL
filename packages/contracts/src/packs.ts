import type { StickerCategoryDto, StickerRarityDto } from "./stickers.js";

export type PackSourceDto = "DAILY" | "STADIUM" | "PROMO" | "ADMIN";
export type ClaimStatusDto =
  | "AVAILABLE"
  | "CONSUMED"
  | "EXPIRED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ALREADY_CLAIMED";

export interface OpenPackRequestDto {
  readonly source: PackSourceDto;
  readonly claimId: string;
}

export interface PackStickerResultDto {
  readonly stickerId: string;
  readonly number: number;
  readonly title: string;
  readonly imageUrl: string;
  readonly rarity: StickerRarityDto;
  readonly category: StickerCategoryDto;
  readonly isNew: boolean;
  readonly quantityAfter: number;
}

export interface OpenPackResponseDto {
  readonly packOpeningId: string;
  readonly source: PackSourceDto;
  readonly stickers: readonly PackStickerResultDto[];
  readonly newCount: number;
  readonly repeatedCount: number;
  readonly createdAt: string;
}

export interface ClaimDailyPackRequestDto {
  readonly clientRequestId?: string;
}

export interface ClaimDailyPackResponseDto {
  readonly claimId: string;
  readonly source: PackSourceDto;
  readonly status: ClaimStatusDto;
  readonly expiresAt?: string;
}

export interface ClaimStadiumPackRequestDto {
  readonly latitude: number;
  readonly longitude: number;
  readonly accuracyMeters?: number;
  readonly requestedAt?: string;
}

export interface ClaimStadiumPackResponseDto {
  readonly claimId: string;
  readonly source: PackSourceDto;
  readonly status: ClaimStatusDto;
  readonly expiresAt?: string;
}
