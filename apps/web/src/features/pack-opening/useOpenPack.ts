import type { OpenPackResponseDto, PackSourceDto } from "@albumsl/contracts";
import { useState } from "react";

import { getPackOpeningErrorMessage } from "./pack-opening-errors";
import { openPack } from "./pack-opening.service";
import { initialStickerSeed } from "@albumsl/domain";
import { isPreviewMode } from "../preview/preview-mode";

function createPreviewPackResult(source: PackSourceDto, claimId: string): OpenPackResponseDto {
  const previewStickers = initialStickerSeed.slice(0, 5).map((sticker, index) => ({
    stickerId: sticker.id,
    number: sticker.number,
    title: sticker.title,
    imageUrl: sticker.imageUrl,
    era: sticker.era,
    rarity: sticker.rarity,
    category: sticker.category,
    tags: sticker.tags,
    isNew: index < 3,
    quantityAfter: index < 3 ? 1 : 2,
  }));

  return {
    packOpeningId: `qa-preview-opening-${claimId}-${Date.now()}`,
    source,
    stickers: previewStickers,
    newCount: previewStickers.filter((sticker) => sticker.isNew).length,
    repeatedCount: previewStickers.filter((sticker) => !sticker.isNew).length,
    createdAt: new Date().toISOString(),
  };
}

export function useOpenPack() {
  const [result, setResult] = useState<OpenPackResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset(): void {
    setResult(null);
    setError(null);
    setLoading(false);
  }

  async function open(source: PackSourceDto, claimId: string): Promise<OpenPackResponseDto | null> {
    setResult(null);
    setError(null);

    if (isPreviewMode()) {
      const previewResult = createPreviewPackResult(source, claimId);
      setResult(previewResult);
      setLoading(false);
      return previewResult;
    }

    setLoading(true);

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
    reset,
    open,
  };
}
