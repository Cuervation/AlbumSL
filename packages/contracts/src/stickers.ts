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
  readonly category: StickerCategoryDto;
  readonly era: StickerEraDto;
  readonly rarity: StickerRarityDto;
  readonly tags: readonly string[];
  readonly description?: string;
}

export interface UserStickerDto {
  readonly stickerId: string;
  readonly quantity: number;
  readonly pastedQuantity: number;
  readonly repeatedQuantity: number;
  readonly collected: boolean;
  readonly pasted: boolean;
}
