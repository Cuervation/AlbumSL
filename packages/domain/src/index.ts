export * from "./constants";
export * from "./entities";
export * from "./enums";
export * from "./errors";
export * from "./helpers/album-progress";
export * from "./helpers/catalog-validation";
export * from "./helpers/user-stickers";

export const DOMAIN_PACKAGE = "@albumsl/domain" as const;

export function getDomainPackageName(): typeof DOMAIN_PACKAGE {
  return DOMAIN_PACKAGE;
}
