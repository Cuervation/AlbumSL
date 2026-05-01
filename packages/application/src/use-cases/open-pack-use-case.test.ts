import {
  ClaimStatus,
  PackSource,
  StickerCategory,
  StickerEra,
  StickerRarity,
  type PackClaim,
  type PackOpening,
  type Sticker,
  type UserAlbumSummary,
  type UserSticker,
} from "@albumsl/domain";
import { describe, expect, it } from "vitest";

import type {
  AuditLogEntry,
  PackOpenRepositories,
  TransactionRunner,
  UserAlbumRepository,
} from "../ports";
import { openPackUseCase } from "./open-pack-use-case";

describe("openPackUseCase", () => {
  it("fails without a valid claim", async () => {
    const context = createContext();

    await expect(openDailyPack(context)).rejects.toMatchObject({
      code: "INVALID_CLAIM",
    });
  });

  it("fails when the claim belongs to another user", async () => {
    const context = createContext({
      claims: [createClaim({ userId: "other-user" })],
    });

    await expect(openDailyPack(context)).rejects.toMatchObject({
      code: "PERMISSION_DENIED",
    });
  });

  it("fails when the claim is expired", async () => {
    const context = createContext({
      claims: [
        createClaim({
          expiresAt: new Date("2026-05-01T11:59:59.000Z"),
        }),
      ],
    });

    await expect(openDailyPack(context)).rejects.toMatchObject({
      code: "CLAIM_EXPIRED",
    });
  });

  it("fails when the claim was already consumed", async () => {
    const context = createContext({
      claims: [createClaim({ status: ClaimStatus.CONSUMED })],
    });

    await expect(openDailyPack(context)).rejects.toMatchObject({
      code: "CLAIM_ALREADY_CONSUMED",
    });
  });

  it("updates user stickers, creates opening, consumes claim and updates album", async () => {
    const context = createContext({
      claims: [createClaim()],
      userStickers: [{ stickerId: "sticker-1", quantity: 1, pastedQuantity: 0 }],
    });

    const result = await openDailyPack(context);

    expect(result.stickers).toHaveLength(5);
    expect(result.newCount).toBe(0);
    expect(result.repeatedCount).toBe(5);
    expect(context.repositories.userStickers.get("sticker-1")?.quantity).toBe(6);
    expect(context.repositories.openings).toHaveLength(1);
    expect(context.repositories.claims.get("claim-1")?.status).toBe(ClaimStatus.CONSUMED);
    expect(context.repositories.albumSummary?.collectedCount).toBe(1);
    expect(context.repositories.albumSummary?.pastedCount).toBe(0);
    expect(context.repositories.auditLogs).toHaveLength(1);
  });

  it("creates missing user stickers as new results", async () => {
    const context = createContext({
      claims: [createClaim()],
    });

    const result = await openDailyPack(context);

    expect(result.newCount).toBe(1);
    expect(result.repeatedCount).toBe(4);
    expect(context.repositories.userStickers.get("sticker-1")?.quantity).toBe(5);
  });
});

async function openDailyPack(context: TestContext) {
  return openPackUseCase(
    {
      userId: "user-1",
      source: PackSource.DAILY,
      claimId: "claim-1",
    },
    {
      transactionRunner: context.transactionRunner,
      clock: { now: () => new Date("2026-05-01T12:00:00.000Z") },
      idGenerator: {
        nextId: (prefix = "id") => `${prefix}-${context.nextId()}`,
      },
      randomGenerator: {
        nextFloat: () => 0,
        nextInt: (minInclusive) => minInclusive,
      },
    },
  );
}

interface TestContext {
  readonly repositories: InMemoryRepositories;
  readonly transactionRunner: TransactionRunner;
  readonly nextId: () => number;
}

function createContext(
  options: {
    readonly claims?: readonly PackClaim[];
    readonly userStickers?: readonly UserSticker[];
  } = {},
): TestContext {
  let id = 0;
  const repositories = new InMemoryRepositories(options.claims ?? [], options.userStickers ?? []);

  return {
    repositories,
    transactionRunner: {
      run: async <T>(work: (repositories: PackOpenRepositories) => Promise<T>): Promise<T> =>
        work(repositories),
    },
    nextId: () => {
      id += 1;
      return id;
    },
  };
}

class InMemoryRepositories implements PackOpenRepositories {
  public readonly claims = new Map<string, PackClaim>();
  public readonly userStickers = new Map<string, UserSticker>();
  public readonly openings: PackOpening[] = [];
  public readonly auditLogs: AuditLogEntry[] = [];
  public albumSummary: UserAlbumSummary | null = null;

  public readonly stickerCatalogRepository = {
    count: async (): Promise<number> => this.stickers.length,
    getActiveStickers: async (): Promise<readonly Sticker[]> => this.stickers,
  };

  public readonly userStickerRepository = {
    findByUserId: async (): Promise<readonly UserSticker[]> => [...this.userStickers.values()],
    findByUserIdAndStickerId: async (
      _userId: string,
      stickerId: string,
    ): Promise<UserSticker | null> => this.userStickers.get(stickerId) ?? null,
    save: async (_userId: string, userSticker: UserSticker): Promise<UserSticker> => {
      this.userStickers.set(userSticker.stickerId, userSticker);
      return userSticker;
    },
    saveMany: async (
      _userId: string,
      userStickers: readonly UserSticker[],
    ): Promise<readonly UserSticker[]> => {
      for (const userSticker of userStickers) {
        this.userStickers.set(userSticker.stickerId, userSticker);
      }

      return userStickers;
    },
  };

  public readonly packClaimRepository = {
    findById: async (claimId: string): Promise<PackClaim | null> =>
      this.claims.get(claimId) ?? null,
    save: async (packClaim: PackClaim): Promise<PackClaim> => {
      this.claims.set(packClaim.id, packClaim);
      return packClaim;
    },
  };

  public readonly packOpeningRepository = {
    save: async (packOpening: PackOpening): Promise<PackOpening> => {
      this.openings.push(packOpening);
      return packOpening;
    },
  };

  public readonly userAlbumRepository: UserAlbumRepository = {
    findByUserId: async (): Promise<UserAlbumSummary | null> => this.albumSummary,
    save: async (summary: UserAlbumSummary): Promise<UserAlbumSummary> => {
      this.albumSummary = summary;
      return summary;
    },
  };

  public readonly auditLogRepository = {
    record: async (entry: AuditLogEntry): Promise<void> => {
      this.auditLogs.push(entry);
    },
  };

  private readonly stickers = [createSticker("sticker-1", StickerRarity.COMMON, 1)];

  public constructor(claims: readonly PackClaim[], userStickers: readonly UserSticker[]) {
    for (const claim of claims) {
      this.claims.set(claim.id, claim);
    }

    for (const userSticker of userStickers) {
      this.userStickers.set(userSticker.stickerId, userSticker);
    }
  }
}

function createClaim(overrides: Partial<PackClaim> = {}): PackClaim {
  return {
    id: "claim-1",
    userId: "user-1",
    source: PackSource.DAILY,
    status: ClaimStatus.AVAILABLE,
    createdAt: new Date("2026-05-01T11:00:00.000Z"),
    expiresAt: new Date("2026-05-02T00:00:00.000Z"),
    ...overrides,
  };
}

function createSticker(id: string, rarity: StickerRarity, number: number): Sticker {
  return {
    id,
    number,
    title: id,
    description: "Test sticker",
    category: StickerCategory.PLAYER,
    era: StickerEra.POST_1990,
    rarity,
    imageUrl: `placeholder://${id}`,
    tags: [],
    sortOrder: number,
    active: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}
