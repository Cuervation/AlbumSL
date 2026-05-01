import { getDomainPackageName } from "@albumsl/domain";

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
