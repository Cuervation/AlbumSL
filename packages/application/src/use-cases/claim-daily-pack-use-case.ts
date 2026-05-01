import { ClaimStatus, PackSource, type PackClaim } from "@albumsl/domain";

import { ApplicationError } from "../errors.js";
import type { Clock, PackClaimRepository } from "../ports.js";

export interface ClaimDailyPackInput {
  readonly userId: string;
  readonly clientRequestId?: string;
}

export interface ClaimDailyPackDependencies {
  readonly packClaimRepository: Pick<PackClaimRepository, "findById" | "save">;
  readonly clock: Clock;
}

export async function claimDailyPackUseCase(
  input: ClaimDailyPackInput,
  dependencies: ClaimDailyPackDependencies,
): Promise<PackClaim> {
  const userId = input.userId.trim();

  if (userId.length === 0) {
    throw new ApplicationError("INVALID_ARGUMENT", "userId is required");
  }

  const now = dependencies.clock.now();
  const dateKey = getUtcDateKey(now);
  const claimId = createDailyClaimId(userId, dateKey);
  const existingClaim = await dependencies.packClaimRepository.findById(claimId);

  if (existingClaim) {
    return existingClaim;
  }

  const claim: PackClaim = {
    id: claimId,
    userId,
    source: PackSource.DAILY,
    status: ClaimStatus.AVAILABLE,
    createdAt: now,
    updatedAt: now,
    expiresAt: getNextUtcDayStart(now),
    metadata: {
      dateKey,
      clientRequestId: input.clientRequestId ?? null,
    },
  };

  return dependencies.packClaimRepository.save(claim);
}

export function createDailyClaimId(userId: string, dateKey: string): string {
  return `daily_${encodeURIComponent(userId)}_${dateKey}`;
}

export function getUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getNextUtcDayStart(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1, 0, 0, 0, 0),
  );
}
