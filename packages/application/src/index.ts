import { getDomainPackageName } from "@albumsl/domain";

export * from "./errors.js";
export * from "./ports.js";
export * from "./use-cases/calculate-album-progress-use-case.js";
export * from "./use-cases/claim-daily-pack-use-case.js";
export * from "./use-cases/open-pack-use-case.js";
export * from "./use-cases/paste-sticker-use-case.js";

export interface ApplicationInfrastructure {
  readonly provider: string;
}

export interface ApplicationContext {
  readonly domainPackage: string;
  readonly infrastructureProvider: string;
  readonly serviceName: string;
}

export function createApplicationContext(options: {
  readonly infrastructure: ApplicationInfrastructure;
}): ApplicationContext {
  return {
    domainPackage: getDomainPackageName(),
    infrastructureProvider: options.infrastructure.provider,
    serviceName: "albumsl-functions",
  };
}
