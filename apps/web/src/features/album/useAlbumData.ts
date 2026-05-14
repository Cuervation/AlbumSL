import {
  buildAlbumView,
  calculateAlbumProgress,
  type AlbumProgress,
  type AlbumStickerView,
} from "@albumsl/domain";
import { initialStickerSeed } from "@albumsl/domain";
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
    if (isPreviewAlbumRequest()) {
      const previewState = createPreviewAlbumState();
      setAlbumStickers(previewState.albumStickers);
      setProgress(previewState.progress);
      setRecentOpenings(previewState.recentOpenings);
      setError(null);
      setLoading(false);
      return;
    }

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

function isPreviewAlbumRequest(): boolean {
  return (
    typeof window !== "undefined" &&
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get("qaPreview") === "1"
  );
}

function createPreviewAlbumState(): {
  readonly albumStickers: readonly AlbumStickerView[];
  readonly progress: AlbumProgress;
  readonly recentOpenings: readonly RecentPackOpening[];
} {
  const previewUserStickers = initialStickerSeed.map((sticker, index) =>
    createPreviewUserSticker(sticker.id, index),
  );

  return {
    albumStickers: buildAlbumView(initialStickerSeed, previewUserStickers),
    progress: calculateAlbumProgress(previewUserStickers, initialStickerSeed.length),
    recentOpenings: [
      {
        id: "preview-opening-1",
        source: "DAILY",
        newCount: 4,
        repeatedCount: 2,
        createdAt: "2026-05-13T00:00:00.000Z",
      },
      {
        id: "preview-opening-2",
        source: "DAILY",
        newCount: 3,
        repeatedCount: 3,
        createdAt: "2026-05-12T00:00:00.000Z",
      },
    ],
  };
}

function createPreviewUserSticker(stickerId: string, index: number): {
  readonly stickerId: string;
  readonly quantity: number;
  readonly pastedQuantity: number;
  readonly firstCollectedAt: Date;
  readonly lastCollectedAt: Date;
  readonly updatedAt: Date;
} {
  const quantity = index < 4 ? 3 : index < 10 ? 2 : index < 18 ? 1 : 0;
  const pastedQuantity = quantity === 0 ? 0 : index < 4 ? 1 : quantity === 2 ? 1 : 1;

  return {
    stickerId,
    quantity,
    pastedQuantity,
    firstCollectedAt: new Date("2026-05-01T00:00:00.000Z"),
    lastCollectedAt: new Date("2026-05-13T00:00:00.000Z"),
    updatedAt: new Date("2026-05-13T00:00:00.000Z"),
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
