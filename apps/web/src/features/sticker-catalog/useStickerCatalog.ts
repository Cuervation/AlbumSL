import { useEffect, useState } from "react";

import type { StickerDto } from "@albumsl/contracts";

import { getAuthErrorMessage } from "../auth/auth-errors";
import { getActiveStickers } from "./sticker-catalog.service";

export interface StickerCatalogState {
  readonly stickers: readonly StickerDto[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
}

export function useStickerCatalog(): StickerCatalogState {
  const [stickers, setStickers] = useState<readonly StickerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStickers(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      setStickers(await getActiveStickers());
    } catch (loadError) {
      setError(getAuthErrorMessage(loadError));
      setStickers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStickers();
  }, []);

  return {
    stickers,
    loading,
    error,
    refresh: loadStickers,
  };
}
