import { getDomainPackageName } from "@albumsl/domain";

export * from "./errors";
export * from "./ports";
export * from "./use-cases/calculate-album-progress-use-case";
export * from "./use-cases/paste-sticker-use-case";

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
