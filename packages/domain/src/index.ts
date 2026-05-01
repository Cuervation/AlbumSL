export const DOMAIN_PACKAGE = "@albumsl/domain" as const;

export function getDomainPackageName(): typeof DOMAIN_PACKAGE {
  return DOMAIN_PACKAGE;
}
