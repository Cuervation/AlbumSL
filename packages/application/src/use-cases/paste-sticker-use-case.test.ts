import type { UserAlbumSummary, UserSticker } from "@albumsl/domain";
import { describe, expect, it } from "vitest";

import type { PackOpenRepositories, TransactionRunner } from "../ports.js";
import { pasteStickerUseCase } from "./paste-sticker-use-case.js";

describe("pasteStickerUseCase", () => {
  it("pastes an available sticker, saves it and recalculates progress", async () => {
    const context = createContext({
      userStickers: [
        { stickerId: "sticker-1", quantity: 2, pastedQuantity: 0 },
        { stickerId: "sticker-2", quantity: 1, pastedQuantity: 0 },
      ],
      totalStickers: 10,
    });

    const result = await pasteStickerUseCase(
      { userId: "user-1", stickerId: "sticker-1" },
      { transactionRunner: context.transactionRunner, clock: fixedClock() },
    );

    expect(result.userSticker).toMatchObject({
      stickerId: "sticker-1",
      quantity: 2,
      pastedQuantity: 1,
    });
    expect(result.albumProgress).toMatchObject({
      totalStickers: 10,
      collectedStickers: 2,
      pastedStickers: 1,
      repeatedStickers: 2,
      completionPercentage: 10,
    });
    expect(context.repositories.albumSummary).toMatchObject({
      userId: "user-1",
      pastedCount: 1,
      repeatedCount: 2,
    });
  });

  it("fails when the user does not have the sticker", async () => {
    const context = createContext();

    await expect(
      pasteStickerUseCase(
        { userId: "user-1", stickerId: "missing" },
        { transactionRunner: context.transactionRunner, clock: fixedClock() },
      ),
    ).rejects.toMatchObject({
      code: "INSUFFICIENT_QUANTITY",
    });
  });

  it("fails when there is no available quantity to paste", async () => {
    const context = createContext({
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

  it("fails when the user sticker state is invalid", async () => {
    const context = createContext({
      userStickers: [{ stickerId: "sticker-1", quantity: 1, pastedQuantity: 2 }],
    });

    await expect(
      pasteStickerUseCase(
        { userId: "user-1", stickerId: "sticker-1" },
        { transactionRunner: context.transactionRunner, clock: fixedClock() },
      ),
    ).rejects.toMatchObject({
      code: "INVALID_ARGUMENT",
    });
  });

  it("does not allow touching another user's sticker through the repository scope", async () => {
    const context = createContext({
      userStickers: [{ stickerId: "sticker-1", quantity: 1, pastedQuantity: 0 }],
      ownerUserId: "other-user",
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
});

interface TestContext {
  readonly repositories: InMemoryRepositories;
  readonly transactionRunner: TransactionRunner;
}

function createContext(
  options: {
    readonly userStickers?: readonly UserSticker[];
    readonly totalStickers?: number;
    readonly ownerUserId?: string;
  } = {},
): TestContext {
  const repositories = new InMemoryRepositories(
    options.userStickers ?? [],
    options.totalStickers ?? 10,
    options.ownerUserId ?? "user-1",
  );

  return {
    repositories,
    transactionRunner: {
      run: async <T>(work: (repositories: PackOpenRepositories) => Promise<T>): Promise<T> =>
        work(repositories),
    },
  };
}

class InMemoryRepositories implements PackOpenRepositories {
  public readonly userStickers = new Map<string, UserSticker>();
  public albumSummary: UserAlbumSummary | null = null;

  public readonly stickerCatalogRepository = {
    count: async (): Promise<number> => this.totalStickers,
    getActiveStickers: async () => [],
  };

  public readonly userStickerRepository = {
    findByUserId: async (userId: string): Promise<readonly UserSticker[]> =>
      userId === this.ownerUserId ? [...this.userStickers.values()] : [],
    findByUserIdAndStickerId: async (
      userId: string,
      stickerId: string,
    ): Promise<UserSticker | null> =>
      userId === this.ownerUserId ? (this.userStickers.get(stickerId) ?? null) : null,
    save: async (userId: string, userSticker: UserSticker): Promise<UserSticker> => {
      if (userId === this.ownerUserId) {
        this.userStickers.set(userSticker.stickerId, userSticker);
      }

      return userSticker;
    },
    saveMany: async (_userId: string, userStickers: readonly UserSticker[]) => userStickers,
  };

  public readonly packClaimRepository = {
    findById: async () => null,
    save: async (packClaim: never) => packClaim,
  };

  public readonly packOpeningRepository = {
    save: async (packOpening: never) => packOpening,
  };

  public readonly userAlbumRepository = {
    findByUserId: async (): Promise<UserAlbumSummary | null> => this.albumSummary,
    save: async (summary: UserAlbumSummary): Promise<UserAlbumSummary> => {
      this.albumSummary = summary;
      return summary;
    },
  };

  public readonly auditLogRepository = {
    record: async (): Promise<void> => undefined,
  };

  public constructor(
    userStickers: readonly UserSticker[],
    private readonly totalStickers: number,
    private readonly ownerUserId: string,
  ) {
    for (const userSticker of userStickers) {
      this.userStickers.set(userSticker.stickerId, userSticker);
    }
  }
}

function fixedClock() {
  return {
    now: () => new Date("2026-05-01T12:00:00.000Z"),
  };
}
