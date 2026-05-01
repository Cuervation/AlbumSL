import type { OpenPackResponseDto, PackSourceDto } from "@albumsl/contracts";
import { useState } from "react";

import { getPackOpeningErrorMessage } from "./pack-opening-errors";
import { openPack } from "./pack-opening.service";

export function useOpenPack() {
  const [result, setResult] = useState<OpenPackResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open(source: PackSourceDto, claimId: string): Promise<OpenPackResponseDto | null> {
    setLoading(true);
    setError(null);

    try {
      const response = await openPack({ source, claimId });
      setResult(response);
      return response;
    } catch (caughtError) {
      setError(getPackOpeningErrorMessage(caughtError));
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    result,
    loading,
    error,
    open,
  };
}
