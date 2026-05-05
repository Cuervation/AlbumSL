import { ClaimStatus, PackSource } from "@albumsl/domain";
import { describe, expect, it } from "vitest";

import { toFirestorePackClaimDocument } from "./pack-claim.mapper.js";
import { toFirestorePackOpeningDocument } from "./pack-opening.mapper.js";
import { toFirestoreUserStickerDocument } from "./user-sticker.mapper.js";

describe("Firestore document mappers", () => {
  it("omits undefined fields from pack claim documents", () => {
    const document = toFirestorePackClaimDocument({
      id: "daily_user-1_2026-05-04",
      userId: "user-1",
      source: PackSource.DAILY,
      status: ClaimStatus.AVAILABLE,
      createdAt: new Date("2026-05-04T12:00:00.000Z"),
      metadata: {
        dateKey: "2026-05-04",
        clientRequestId: null,
      },
    });

    expect(document).not.toHaveProperty("eventId");
    expect(document).not.toHaveProperty("expiresAt");
    expect(document).not.toHaveProperty("consumedAt");
    expect(document).not.toHaveProperty("updatedAt");
    expect(document).not.toHaveProperty("packId");
    expect(document).not.toHaveProperty("reason");
  });

  it("omits undefined fields from pack opening documents", () => {
    const document = toFirestorePackOpeningDocument({
      id: "opening-1",
      userId: "user-1",
      source: PackSource.DAILY,
      claimId: "claim-1",
      stickerIds: ["sticker-1"],
      newCount: 1,
      repeatedCount: 0,
      createdAt: new Date("2026-05-04T12:00:00.000Z"),
    });

    expect(document).not.toHaveProperty("auditLogId");
  });

  it("omits undefined fields from user sticker documents", () => {
    const document = toFirestoreUserStickerDocument("user-1", {
      stickerId: "sticker-1",
      quantity: 2,
      pastedQuantity: 1,
      acquiredAt: new Date("2026-05-04T12:00:00.000Z"),
    });

    expect(document).not.toHaveProperty("lastCollectedAt");
    expect(document).not.toHaveProperty("updatedAt");
    expect(document.firstCollectedAt).toBeInstanceOf(Date);
  });
});
