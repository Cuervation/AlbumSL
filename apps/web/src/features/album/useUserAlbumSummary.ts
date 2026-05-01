import type { UserAlbumSummaryDto } from "@albumsl/contracts";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../auth/useAuth";
import { getAlbumErrorMessage } from "./album-errors";
import { getUserAlbumSummary } from "./album.service";

export function useUserAlbumSummary() {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [summary, setSummary] = useState<UserAlbumSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!userId) {
      setSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setSummary(await getUserAlbumSummary(userId));
    } catch (caughtError) {
      setError(getAlbumErrorMessage(caughtError));
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    summary,
    loading,
    error,
    refresh,
  };
}
