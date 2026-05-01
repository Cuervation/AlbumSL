import type {
  AlbumProgress,
  PackClaim,
  PackOpening,
  PackSource,
  Sticker,
  StickerId,
  UserAlbumSummary,
  UserSticker,
} from "@albumsl/domain";

export interface StickerCatalogRepository {
  count(): Promise<number>;
  getActiveStickers(): Promise<readonly Sticker[]>;
  getStickerById(stickerId: StickerId): Promise<Sticker | null>;
  getStickersByIds(stickerIds: readonly StickerId[]): Promise<readonly Sticker[]>;
  findAll(): Promise<readonly Sticker[]>;
  findById(stickerId: StickerId): Promise<Sticker | null>;
}

export interface UserStickerRepository {
  findByUserId(userId: string): Promise<readonly UserSticker[]>;
  findByUserIdAndStickerId(userId: string, stickerId: StickerId): Promise<UserSticker | null>;
  save(userId: string, userSticker: UserSticker): Promise<UserSticker>;
  saveMany(userId: string, userStickers: readonly UserSticker[]): Promise<readonly UserSticker[]>;
}

export interface PackClaimRepository {
  findById(claimId: string): Promise<PackClaim | null>;
  findLatestByUserAndSource(userId: string, source: PackSource): Promise<PackClaim | null>;
  save(packClaim: PackClaim): Promise<PackClaim>;
}

export interface PackOpeningRepository {
  findById(packOpeningId: string): Promise<PackOpening | null>;
  save(packOpening: PackOpening): Promise<PackOpening>;
}

export interface UserAlbumRepository {
  findByUserId(userId: string): Promise<UserAlbumSummary | null>;
  save(summary: UserAlbumSummary): Promise<UserAlbumSummary>;
}

export interface AuditLogEntry {
  readonly id: string;
  readonly actorUserId: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly createdAt: Date;
  readonly severity: "INFO" | "WARNING" | "ERROR";
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

export interface PackOpenRepositories {
  readonly stickerCatalogRepository: Pick<StickerCatalogRepository, "count" | "getActiveStickers">;
  readonly userStickerRepository: Pick<
    UserStickerRepository,
    "findByUserId" | "findByUserIdAndStickerId" | "save" | "saveMany"
  >;
  readonly packClaimRepository: Pick<PackClaimRepository, "findById" | "save">;
  readonly packOpeningRepository: Pick<PackOpeningRepository, "save">;
  readonly userAlbumRepository: Pick<UserAlbumRepository, "findByUserId" | "save">;
  readonly auditLogRepository: Pick<AuditLogRepository, "record">;
}

export interface TransactionRunner {
  run<T>(work: (repositories: PackOpenRepositories) => Promise<T>): Promise<T>;
}

export interface UserAlbumSummaryInput {
  readonly userId: string;
  readonly progress: AlbumProgress;
  readonly existingSummary: UserAlbumSummary | null;
  readonly now: Date;
}
