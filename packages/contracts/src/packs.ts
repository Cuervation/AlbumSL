import type { StickerDto } from "./stickers";

export type PackSourceDto = "DAILY" | "STADIUM" | "PROMO" | "ADMIN";
export type ClaimStatusDto = "PENDING" | "APPROVED" | "REJECTED" | "ALREADY_CLAIMED";

export interface OpenPackRequestDto {
  readonly source: PackSourceDto;
  readonly claimId?: string;
}

export interface OpenPackResponseDto {
  readonly packOpeningId: string;
  readonly source: PackSourceDto;
  readonly stickers: readonly StickerDto[];
  readonly openedAt: string;
}

export interface ClaimDailyPackRequestDto {
  readonly requestId?: string;
}

export interface ClaimDailyPackResponseDto {
  readonly claimId: string;
  readonly status: ClaimStatusDto;
  readonly packOpening?: OpenPackResponseDto;
}

export interface ClaimStadiumPackRequestDto {
  readonly latitude: number;
  readonly longitude: number;
  readonly accuracyMeters?: number;
  readonly requestedAt?: string;
}

export interface ClaimStadiumPackResponseDto {
  readonly claimId: string;
  readonly status: ClaimStatusDto;
  readonly packOpening?: OpenPackResponseDto;
}
