import type {
  PackClaim,
  PackOpening,
  PackSource,
  Sticker,
  StickerId,
  UserSticker,
} from "@albumsl/domain";

export interface StickerCatalogRepository {
  count(): Promise<number>;
  findAll(): Promise<readonly Sticker[]>;
  findById(stickerId: StickerId): Promise<Sticker | null>;
}

export interface UserStickerRepository {
  findByUserId(userId: string): Promise<readonly UserSticker[]>;
  findByUserIdAndStickerId(userId: string, stickerId: StickerId): Promise<UserSticker | null>;
  save(userId: string, userSticker: UserSticker): Promise<UserSticker>;
}

export interface PackClaimRepository {
  findLatestByUserAndSource(userId: string, source: PackSource): Promise<PackClaim | null>;
  save(packClaim: PackClaim): Promise<PackClaim>;
}

export interface PackOpeningRepository {
  findById(packOpeningId: string): Promise<PackOpening | null>;
  save(packOpening: PackOpening): Promise<PackOpening>;
}

export interface AuditLogEntry {
  readonly id: string;
  readonly actorId: string;
  readonly action: string;
  readonly occurredAt: Date;
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface AuditLogRepository {
  record(entry: AuditLogEntry): Promise<void>;
}

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  nextId(prefix?: string): string;
}

export interface RandomGenerator {
  nextFloat(): number;
  nextInt(minInclusive: number, maxExclusive: number): number;
}
