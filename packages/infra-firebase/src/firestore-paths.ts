export const FirestoreCollections = {
  users: "users",
  stickers: "stickers",
  userAlbums: "userAlbums",
  userStickers: "userStickers",
  packClaims: "packClaims",
  packOpenings: "packOpenings",
  stadiumEvents: "stadiumEvents",
  auditLogs: "auditLogs",
  system: "system",
} as const;

export const FirestoreSystemDocuments = {
  config: "config",
} as const;

export type UserStickerItemPath = `userStickers/${string}/items/${string}`;
export type SystemConfigPath = "system/config";

export function userStickerItemPath(userId: string, stickerId: string): UserStickerItemPath {
  return `${FirestoreCollections.userStickers}/${userId}/items/${stickerId}`;
}

export function systemConfigPath(): SystemConfigPath {
  return `${FirestoreCollections.system}/${FirestoreSystemDocuments.config}`;
}
