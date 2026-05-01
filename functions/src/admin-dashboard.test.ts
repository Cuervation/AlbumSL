import { describe, expect, it } from "vitest";

import type { AdminDashboardDataSource } from "./admin-dashboard.js";
import { getAdminDashboard } from "./admin-dashboard.js";

describe("getAdminDashboard", () => {
  it("rejects unauthenticated users", async () => {
    await expect(getAdminDashboard(undefined, createDataSource())).rejects.toMatchObject({
      code: "unauthenticated",
    });
  });

  it("rejects authenticated non-admin users", async () => {
    await expect(
      getAdminDashboard({ uid: "user-1", token: { admin: false } }, createDataSource()),
    ).rejects.toMatchObject({
      code: "permission-denied",
    });
  });

  it("returns read-only dashboard metrics for admins", async () => {
    const result = await getAdminDashboard(
      { uid: "admin-1", token: { admin: true } },
      createDataSource(),
    );

    expect(result).toMatchObject({
      totalUsers: 2,
      totalStickers: 5,
      activeStickers: 4,
      inactiveStickers: 1,
      totalPackOpenings: 3,
      totalPackClaims: 6,
    });
    expect(result.recentPackOpenings).toHaveLength(1);
    expect(result.recentPackClaims).toHaveLength(1);
  });
});

function createDataSource(): AdminDashboardDataSource {
  return {
    countUsers: async () => 2,
    countStickers: async () => 5,
    countActiveStickers: async () => 4,
    countInactiveStickers: async () => 1,
    countPackOpenings: async () => 3,
    countPackClaims: async () => 6,
    getRecentPackOpenings: async () => [
      {
        id: "opening-1",
        userId: "user-1",
        source: "DAILY",
        claimId: "claim-1",
        newCount: 2,
        repeatedCount: 3,
        createdAt: "2026-05-01T12:00:00.000Z",
      },
    ],
    getRecentPackClaims: async () => [
      {
        id: "claim-1",
        userId: "user-1",
        source: "DAILY",
        status: "CONSUMED",
        createdAt: "2026-05-01T11:00:00.000Z",
        consumedAt: "2026-05-01T12:00:00.000Z",
      },
    ],
  };
}
