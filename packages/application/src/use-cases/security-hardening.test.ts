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

import type { AuditLogEntry, PackOpenRepositories, TransactionRunner } from "../ports.js";
import { claimDailyPackUseCase } from "./claim-daily-pack-use-case.js";
import { openPackUseCase } from "./open-pack-use-case.js";
import { pasteStickerUseCase } from "./paste-sticker-use-case.js";

describe("security hardening use cases", () => {
  it("openPackUseCase fails if the claim belongs to another user", async () => {
    const context = createOpenPackContext({
      claims: [createClaim({ userId: "other-user" })],
    });

    await expect(openDailyPack(context)).rejects.toMatchObject({
      code: "PERMISSION_DENIED",
    });
  });

  it("openPackUseCase fails if the claim is already consumed", async () => {
    const context = createOpenPackContext({
      claims: [createClaim({ status: ClaimStatus.CONSUMED })],
    });

    await expect(openDailyPack(context)).rejects.toMatchObject({
      code: "CLAIM_ALREADY_CONSUMED",
    });
  });

  it("openPackUseCase consumes the claim when opening succeeds", async () => {
    const context = createOpenPackContext({
      claims: [createClaim()],
    });

    await openDailyPack(context);

    expect(context.repositories.claims.get("claim-1")?.status).toBe(ClaimStatus.CONSUMED);
    expect(context.repositories.claims.get("claim-1")?.packId).toBe("opening-1");
  });

  it("openPackUseCase increments quantity when a repeated sticker is picked", async () => {
    const context = createOpenPackContext({
      claims: [createClaim()],
      userStickers: [{ stickerId: "sticker-1", quantity: 1, pastedQuantity: 0 }],
    });

    await openDailyPack(context);

    expect(context.repositories.userStickers.get("sticker-1")?.quantity).toBe(6);
  });

  it("pasteStickerUseCase fails if pastedQuantity is already equal to quantity", async () => {
    const context = createOpenPackContext({
      userStickers: [{ stickerId: "sticker-1", quantity: 1, pastedQuantity: 1 }],
    });

    await expect(
      pasteStickerUseCase(
        { userId: "user-1", stickerId: "sticker-1" },
        { transactionRunner: context.transactionRunner, clock: fixedClock() },
      ),
    ).rejects.toMatchObject({
      code: "INSUFFICIENT_QUANTITY",
    });
  });

  it("claimDailyPackUseCase does not duplicate the same day claim", async () => {
    const repository = new InMemoryPackClaimRepository();
    const dependencies = {
      packClaimRepository: repository,
      clock: fixedClock(),
    };

    const firstClaim = await claimDailyPackUseCase({ userId: "user-1" }, dependencies);
    const secondClaim = await claimDailyPackUseCase({ userId: "user-1" }, dependencies);

    expect(secondClaim.id).toBe(firstClaim.id);
    expect(repository.saveCount).toBe(1);
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
      clock: fixedClock(),
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
  readonly repositories: InMemoryOpenPackRepositories;
  readonly transactionRunner: TransactionRunner;
  readonly nextId: () => number;
}

function createOpenPackContext(
  options: {
    readonly claims?: readonly PackClaim[];
    readonly userStickers?: readonly UserSticker[];
  } = {},
): TestContext {
  let id = 0;
  const repositories = new InMemoryOpenPackRepositories(
    options.claims ?? [],
    options.userStickers ?? [],
  );

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

class InMemoryOpenPackRepositories implements PackOpenRepositories {
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

  public readonly userAlbumRepository = {
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

  private readonly stickers = [createSticker("sticker-1")];

  public constructor(claims: readonly PackClaim[], userStickers: readonly UserSticker[]) {
    for (const claim of claims) {
      this.claims.set(claim.id, claim);
    }

    for (const userSticker of userStickers) {
      this.userStickers.set(userSticker.stickerId, userSticker);
    }
  }
}

class InMemoryPackClaimRepository {
  public readonly claims = new Map<string, PackClaim>();
  public saveCount = 0;

  public async findById(claimId: string): Promise<PackClaim | null> {
    return this.claims.get(claimId) ?? null;
  }

  public async save(packClaim: PackClaim): Promise<PackClaim> {
    this.saveCount += 1;
    this.claims.set(packClaim.id, packClaim);
    return packClaim;
  }
}

function createClaim(overrides: Partial<PackClaim> = {}): PackClaim {
  return {
    id: "claim-1",
    userId: "user-1",
    source: PackSource.DAILY,
    status: ClaimStatus.AVAILABLE,
    createdAt: new Date("2026-05-01T11:00:00.000Z"),
    updatedAt: new Date("2026-05-01T11:00:00.000Z"),
    expiresAt: new Date("2026-05-02T00:00:00.000Z"),
    ...overrides,
  };
}

function createSticker(id: string): Sticker {
  return {
    id,
    number: 1,
    title: "Test sticker",
    description: "Test sticker",
    category: StickerCategory.PLAYER,
    era: StickerEra.POST_1990,
    rarity: StickerRarity.COMMON,
    imageUrl: `placeholder://${id}`,
    tags: [],
    sortOrder: 1,
    active: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function fixedClock() {
  return {
    now: () => new Date("2026-05-01T12:00:00.000Z"),
  };
}
