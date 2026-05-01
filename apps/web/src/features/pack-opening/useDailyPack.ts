import type { ClaimDailyPackResponseDto } from "@albumsl/contracts";
import { useState } from "react";

import { getPackOpeningErrorMessage } from "./pack-opening-errors";
import { claimDailyPack } from "./pack-opening.service";

export function useDailyPack() {
  const [claim, setClaim] = useState<ClaimDailyPackResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claimDaily(): Promise<ClaimDailyPackResponseDto | null> {
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
