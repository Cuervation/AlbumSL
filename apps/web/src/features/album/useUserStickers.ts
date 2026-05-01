import type { UserSticker } from "@albumsl/domain";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../auth/useAuth";
import { getAlbumErrorMessage } from "./album-errors";
import { getUserStickers } from "./album.service";

export function useUserStickers() {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [userStickers, setUserStickers] = useState<readonly UserSticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!userId) {
      setUserStickers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setUserStickers(await getUserStickers(userId));
    } catch (caughtError) {
      setError(getAlbumErrorMessage(caughtError));
      setUserStickers([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    userStickers,
    loading,
    error,
    refresh,
  };
}
