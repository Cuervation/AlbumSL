export * from "./album.js";
export * from "./auth.js";
export * from "./errors.js";
export * from "./packs.js";
export * from "./stickers.js";

export interface HealthResponseDto {
  readonly ok: true;
  readonly service: string;
}
