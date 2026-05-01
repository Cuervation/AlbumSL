import {
  buildAlbumView,
  calculateAlbumProgress,
  type AlbumProgress,
  type AlbumStickerView,
} from "@albumsl/domain";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../auth/useAuth";
import { getAlbumErrorMessage } from "./album-errors";
import {
  getActiveAlbumStickers,
  getRecentPackOpenings,
  getUserAlbumSummary,
  getUserStickers,
  type RecentPackOpening,
} from "./album.service";

export interface AlbumDataState {
  readonly albumStickers: readonly AlbumStickerView[];
  readonly progress: AlbumProgress;
  readonly recentOpenings: readonly RecentPackOpening[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
}

const EMPTY_PROGRESS: AlbumProgress = {
  totalStickers: 0,
  collectedStickers: 0,
  pastedStickers: 0,
  repeatedStickers: 0,
  completionPercentage: 0,
};

export function useAlbumData(): AlbumDataState {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [albumStickers, setAlbumStickers] = useState<readonly AlbumStickerView[]>([]);
  const [progress, setProgress] = useState<AlbumProgress>(EMPTY_PROGRESS);
  const [recentOpenings, setRecentOpenings] = useState<readonly RecentPackOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!userId) {
      setAlbumStickers([]);
      setProgress(EMPTY_PROGRESS);
      setRecentOpenings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [stickers, userStickers, summary, openings] = await Promise.all([
        getActiveAlbumStickers(),
        getUserStickers(userId),
        getUserAlbumSummary(userId),
        getRecentPackOpenings(userId),
      ]);
      const calculatedProgress = calculateAlbumProgress(userStickers, stickers.length);

      setAlbumStickers(buildAlbumView(stickers, userStickers));
      setProgress(summary ? mapSummaryToProgress(summary) : calculatedProgress);
      setRecentOpenings(openings);
    } catch (caughtError) {
      setError(getAlbumErrorMessage(caughtError));
      setAlbumStickers([]);
      setProgress(EMPTY_PROGRESS);
      setRecentOpenings([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    albumStickers,
    progress,
    recentOpenings,
    loading,
    error,
    refresh,
  };
}

function mapSummaryToProgress(summary: {
  readonly totalStickers: number;
  readonly collectedCount: number;
  readonly pastedCount: number;
  readonly repeatedCount: number;
  readonly completionPercentage: number;
}): AlbumProgress {
  return {
    totalStickers: summary.totalStickers,
    collectedStickers: summary.collectedCount,
    pastedStickers: summary.pastedCount,
    repeatedStickers: summary.repeatedCount,
    completionPercentage: summary.completionPercentage,
  };
}
