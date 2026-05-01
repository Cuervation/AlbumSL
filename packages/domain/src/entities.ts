import type { ClaimStatus, PackSource, StickerCategory, StickerEra, StickerRarity } from "./enums";

export type StickerId = string;
export type StickerNumber = number;
export type StickerTag = string;

export interface Championship {
  readonly id: string;
  readonly name: string;
  readonly year: number;
  readonly title?: string;
}

export interface PlayerEra {
  readonly label: string;
  readonly fromYear: number;
  readonly toYear?: number;
}

export interface Sticker {
  readonly id: StickerId;
  readonly number: StickerNumber;
  readonly title: string;
  readonly category: StickerCategory;
  readonly era: StickerEra;
  readonly rarity: StickerRarity;
  readonly tags: readonly StickerTag[];
  readonly championship?: Championship;
  readonly playerEra?: PlayerEra;
  readonly description?: string;
}

export interface UserSticker {
  readonly stickerId: StickerId;
  readonly quantity: number;
  readonly pastedQuantity: number;
  readonly acquiredAt?: Date;
  readonly updatedAt?: Date;
}

export interface UserStickerCollection {
  readonly userId: string;
  readonly stickers: readonly UserSticker[];
  readonly updatedAt?: Date;
}

export interface AlbumProgress {
  readonly totalStickers: number;
  readonly collectedStickers: number;
  readonly pastedStickers: number;
  readonly repeatedStickers: number;
  readonly completionPercentage: number;
}

export interface UserAlbum {
  readonly userId: string;
  readonly totalStickers: number;
  readonly stickers: readonly UserSticker[];
  readonly progress: AlbumProgress;
}

export interface Pack {
  readonly id: string;
  readonly source: PackSource;
  readonly stickerIds: readonly StickerId[];
  readonly createdAt: Date;
}

export interface PackOpening {
  readonly id: string;
  readonly userId: string;
  readonly packId: string;
  readonly source: PackSource;
  readonly stickerIds: readonly StickerId[];
  readonly openedAt: Date;
  readonly auditLogId?: string;
}

export interface PackClaim {
  readonly id: string;
  readonly userId: string;
  readonly source: PackSource;
  readonly status: ClaimStatus;
  readonly claimedAt: Date;
  readonly packId?: string;
  readonly reason?: string;
}
