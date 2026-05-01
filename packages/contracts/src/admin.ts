export type AdminDashboardRequestDto = Record<string, never>;

export interface AdminRecentPackOpeningDto {
  readonly id: string;
  readonly userId: string;
  readonly source: string;
  readonly claimId?: string;
  readonly newCount: number;
  readonly repeatedCount: number;
  readonly createdAt: string;
}

export interface AdminRecentPackClaimDto {
  readonly id: string;
  readonly userId: string;
  readonly source: string;
  readonly status: string;
  readonly createdAt: string;
  readonly expiresAt?: string;
  readonly consumedAt?: string;
}

export interface AdminDashboardResponseDto {
  readonly totalUsers: number;
  readonly totalStickers: number;
  readonly activeStickers: number;
  readonly inactiveStickers: number;
  readonly totalPackOpenings: number;
  readonly totalPackClaims: number;
  readonly recentPackOpenings: readonly AdminRecentPackOpeningDto[];
  readonly recentPackClaims: readonly AdminRecentPackClaimDto[];
}
