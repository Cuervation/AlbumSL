import type {
  AdminDashboardResponseDto,
  AdminRecentPackClaimDto,
  AdminRecentPackOpeningDto,
} from "@albumsl/contracts";
import { HttpsError } from "firebase-functions/v2/https";

export interface AdminDashboardAuth {
  readonly uid?: string;
  readonly token?: {
    readonly admin?: unknown;
  };
}

export interface AdminDashboardDataSource {
  readonly countUsers: () => Promise<number>;
  readonly countStickers: () => Promise<number>;
  readonly countActiveStickers: () => Promise<number>;
  readonly countInactiveStickers: () => Promise<number>;
  readonly countPackOpenings: () => Promise<number>;
  readonly countPackClaims: () => Promise<number>;
  readonly getRecentPackOpenings: (limit: number) => Promise<readonly AdminRecentPackOpeningDto[]>;
  readonly getRecentPackClaims: (limit: number) => Promise<readonly AdminRecentPackClaimDto[]>;
}

const RECENT_LIMIT = 10;

export async function getAdminDashboard(
  auth: AdminDashboardAuth | undefined,
  dataSource: AdminDashboardDataSource,
): Promise<AdminDashboardResponseDto> {
  assertAdmin(auth);

  const [
    totalUsers,
    totalStickers,
    activeStickers,
    inactiveStickers,
    totalPackOpenings,
    totalPackClaims,
    recentPackOpenings,
    recentPackClaims,
  ] = await Promise.all([
    dataSource.countUsers(),
    dataSource.countStickers(),
    dataSource.countActiveStickers(),
    dataSource.countInactiveStickers(),
    dataSource.countPackOpenings(),
    dataSource.countPackClaims(),
    dataSource.getRecentPackOpenings(RECENT_LIMIT),
    dataSource.getRecentPackClaims(RECENT_LIMIT),
  ]);

  return {
    totalUsers,
    totalStickers,
    activeStickers,
    inactiveStickers,
    totalPackOpenings,
    totalPackClaims,
    recentPackOpenings,
    recentPackClaims,
  };
}

function assertAdmin(auth: AdminDashboardAuth | undefined): void {
  if (!auth?.uid) {
    throw new HttpsError("unauthenticated", "Authentication is required", {
      code: "UNAUTHENTICATED",
    });
  }

  if (auth.token?.admin !== true) {
    throw new HttpsError("permission-denied", "Admin custom claim is required", {
      code: "ADMIN_REQUIRED",
    });
  }
}
