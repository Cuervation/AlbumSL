import type { ApplicationInfrastructure } from "@albumsl/application";

export function createFirebaseInfrastructure(): ApplicationInfrastructure {
  return {
    provider: "firebase",
  };
}
