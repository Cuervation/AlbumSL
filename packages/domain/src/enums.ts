export const StickerCategory = {
  PLAYER: "PLAYER",
  COACH: "COACH",
  CHAMPIONSHIP: "CHAMPIONSHIP",
  HISTORIC_MOMENT: "HISTORIC_MOMENT",
  STADIUM: "STADIUM",
  JERSEY: "JERSEY",
  FANS: "FANS",
  CLASSIC_MATCH: "CLASSIC_MATCH",
  SPECIAL: "SPECIAL",
} as const;

export type StickerCategory = (typeof StickerCategory)[keyof typeof StickerCategory];

export const StickerEra = {
  PRE_1990: "PRE_1990",
  POST_1990: "POST_1990",
} as const;

export type StickerEra = (typeof StickerEra)[keyof typeof StickerEra];

export const StickerRarity = {
  COMMON: "COMMON",
  UNCOMMON: "UNCOMMON",
  RARE: "RARE",
  EPIC: "EPIC",
  LEGENDARY: "LEGENDARY",
} as const;

export type StickerRarity = (typeof StickerRarity)[keyof typeof StickerRarity];

export const PackSource = {
  DAILY: "DAILY",
  STADIUM: "STADIUM",
  PROMO: "PROMO",
  ADMIN: "ADMIN",
} as const;

export type PackSource = (typeof PackSource)[keyof typeof PackSource];

export const ClaimStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ALREADY_CLAIMED: "ALREADY_CLAIMED",
} as const;

export type ClaimStatus = (typeof ClaimStatus)[keyof typeof ClaimStatus];
