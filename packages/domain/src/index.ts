export * from "./constants.js";
export * from "./entities.js";
export * from "./enums.js";
export * from "./errors.js";
export * from "./helpers/album-progress.js";
export * from "./helpers/catalog-validation.js";
export * from "./helpers/pack-selection.js";
export * from "./helpers/user-stickers.js";
export * from "./seed/stickers.seed.js";

export const DOMAIN_PACKAGE = "@albumsl/domain" as const;

export function getDomainPackageName(): typeof DOMAIN_PACKAGE {
  return DOMAIN_PACKAGE;
}
