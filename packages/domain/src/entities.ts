import type {
  ClaimStatus,
  PackSource,
  StickerCategory,
  StickerEra,
  StickerRarity,
} from "./enums.js";

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
  readonly description: string;
  readonly category: StickerCategory;
  readonly era: StickerEra;
  readonly rarity: StickerRarity;
  readonly imageUrl: string;
  readonly tags: readonly StickerTag[];
  readonly sortOrder: number;
  readonly active: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly championship?: Championship;
  readonly playerEra?: PlayerEra;
}

export interface UserSticker {
  readonly stickerId: StickerId;
  readonly quantity: number;
  readonly pastedQuantity: number;
  readonly acquiredAt?: Date;
  readonly firstCollectedAt?: Date;
  readonly lastCollectedAt?: Date;
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

export interface UserAlbumSummary {
  readonly userId: string;
  readonly totalStickers: number;
  readonly collectedCount: number;
  readonly pastedCount: number;
  readonly repeatedCount: number;
  readonly completionPercentage: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
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
  readonly source: PackSource;
  readonly claimId: string;
  readonly stickerIds: readonly StickerId[];
  readonly newCount: number;
  readonly repeatedCount: number;
  readonly createdAt: Date;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly packId?: string;
  readonly openedAt?: Date;
  readonly auditLogId?: string;
}

export interface PackClaim {
  readonly id: string;
  readonly userId: string;
  readonly source: PackSource;
  readonly status: ClaimStatus;
  readonly createdAt: Date;
  readonly expiresAt?: Date;
  readonly consumedAt?: Date;
  readonly updatedAt?: Date;
  readonly eventId?: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly claimedAt?: Date;
  readonly packId?: string;
  readonly reason?: string;
}
