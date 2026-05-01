import { ClaimStatus, PackSource, type PackClaim } from "@albumsl/domain";
import { describe, expect, it } from "vitest";

import type { PackClaimRepository } from "../ports";
import { claimDailyPackUseCase } from "./claim-daily-pack-use-case";

describe("claimDailyPackUseCase", () => {
  it("creates a daily claim when the user has no claim for the day", async () => {
    const repository = new InMemoryPackClaimRepository();

    const claim = await claimDailyPackUseCase(
      { userId: "user-1", clientRequestId: "request-1" },
      { packClaimRepository: repository, clock: fixedClock() },
    );

    expect(claim).toMatchObject({
      userId: "user-1",
      source: PackSource.DAILY,
      status: ClaimStatus.AVAILABLE,
    });
    expect(claim.expiresAt?.toISOString()).toBe("2026-05-02T00:00:00.000Z");
    expect(repository.size).toBe(1);
  });

  it("does not duplicate the daily claim for the same day", async () => {
    const repository = new InMemoryPackClaimRepository();
    const dependencies = { packClaimRepository: repository, clock: fixedClock() };

    const firstClaim = await claimDailyPackUseCase({ userId: "user-1" }, dependencies);
    const secondClaim = await claimDailyPackUseCase({ userId: "user-1" }, dependencies);

    expect(secondClaim.id).toBe(firstClaim.id);
    expect(repository.size).toBe(1);
  });
});

class InMemoryPackClaimRepository implements Pick<PackClaimRepository, "findById" | "save"> {
  private readonly claims = new Map<string, PackClaim>();

  public get size(): number {
    return this.claims.size;
  }

  public async findById(claimId: string): Promise<PackClaim | null> {
    return this.claims.get(claimId) ?? null;
  }

  public async save(packClaim: PackClaim): Promise<PackClaim> {
    this.claims.set(packClaim.id, packClaim);
    return packClaim;
  }
}

function fixedClock() {
  return {
    now: () => new Date("2026-05-01T12:00:00.000Z"),
  };
}
