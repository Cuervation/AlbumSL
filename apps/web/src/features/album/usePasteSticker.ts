import type { PasteStickerResponseDto } from "@albumsl/contracts";
import { useState } from "react";

import { getAlbumErrorMessage } from "./album-errors";
import { pasteSticker } from "./album.service";

export function usePasteSticker() {
  const [result, setResult] = useState<PasteStickerResponseDto | null>(null);
  const [loadingStickerId, setLoadingStickerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function paste(stickerId: string): Promise<PasteStickerResponseDto | null> {
    setLoadingStickerId(stickerId);
    setError(null);

    try {
      const response = await pasteSticker(stickerId);
      setResult(response);
      return response;
    } catch (caughtError) {
      setError(getAlbumErrorMessage(caughtError));
      return null;
    } finally {
      setLoadingStickerId(null);
    }
  }

  return {
    result,
    loadingStickerId,
    error,
    paste,
  };
}
