import type { ClaimDailyPackResponseDto } from "@albumsl/contracts";
import { useState } from "react";

import { getPackOpeningErrorMessage } from "./pack-opening-errors";
import { claimDailyPack } from "./pack-opening.service";
import { isPreviewMode } from "../preview/preview-mode";

function createPreviewClaim(): ClaimDailyPackResponseDto {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  return {
    claimId: "qa-preview-daily-pack",
    source: "DAILY",
    status: "AVAILABLE",
    expiresAt,
  };
}

export function useDailyPack() {
  const [claim, setClaim] = useState<ClaimDailyPackResponseDto | null>(() =>
    isPreviewMode() ? createPreviewClaim() : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claimDaily(): Promise<ClaimDailyPackResponseDto | null> {
    if (isPreviewMode()) {
      const previewClaim = createPreviewClaim();
      setClaim(previewClaim);
      setError(null);
      setLoading(false);
      return previewClaim;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await claimDailyPack({
        clientRequestId: crypto.randomUUID(),
      });
      setClaim(response);
      return response;
    } catch (caughtError) {
      setError(getPackOpeningErrorMessage(caughtError));
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    claim,
    setClaim,
    loading,
    error,
    claimDaily,
  };
}
