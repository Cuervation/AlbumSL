export type StickerCategoryDto =
  | "PLAYER"
  | "COACH"
  | "CHAMPIONSHIP"
  | "HISTORIC_MOMENT"
  | "STADIUM"
  | "JERSEY"
  | "FANS"
  | "CLASSIC_MATCH"
  | "SPECIAL";

export type StickerEraDto = "PRE_1990" | "POST_1990";

export type StickerRarityDto = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface StickerDto {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly description: string;
  readonly category: StickerCategoryDto;
  readonly era: StickerEraDto;
  readonly rarity: StickerRarityDto;
  readonly imageUrl: string;
  readonly tags: readonly string[];
  readonly sortOrder: number;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UserStickerDto {
  readonly stickerId: string;
  readonly quantity: number;
  readonly pastedQuantity: number;
  readonly repeatedQuantity: number;
  readonly collected: boolean;
  readonly pasted: boolean;
}
