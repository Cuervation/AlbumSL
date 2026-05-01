import type { ApplicationInfrastructure } from "@albumsl/application";

export * from "./firestore-paths.js";
export * from "./mappers/audit-log.mapper.js";
export * from "./mappers/firestore-value.mapper.js";
export * from "./mappers/pack-claim.mapper.js";
export * from "./mappers/pack-opening.mapper.js";
export * from "./mappers/sticker.mapper.js";
export * from "./mappers/user-album.mapper.js";
export * from "./mappers/user-sticker.mapper.js";
export * from "./repositories/firestore-audit-log.repository.js";
export * from "./repositories/firestore-pack-claim.repository.js";
export * from "./repositories/firestore-pack-opening.repository.js";
export * from "./repositories/firestore-repository-context.js";
export * from "./repositories/firestore-sticker-catalog.repository.js";
export * from "./repositories/firestore-transaction-runner.js";
export * from "./repositories/firestore-user-album.repository.js";
export * from "./repositories/firestore-user-sticker.repository.js";

export function createFirebaseInfrastructure(): ApplicationInfrastructure {
  return {
    provider: "firebase",
  };
}
