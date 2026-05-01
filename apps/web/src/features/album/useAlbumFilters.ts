import {
  AlbumStickerStatus,
  type AlbumStickerView,
  type StickerCategory,
  type StickerEra,
  type StickerRarity,
} from "@albumsl/domain";
import { useDeferredValue, useMemo, useState } from "react";

export const AlbumStatusFilter = {
  ALL: "ALL",
  COLLECTED: "COLLECTED",
  PASTED: "PASTED",
  MISSING: "MISSING",
  REPEATED: "REPEATED",
} as const;

export type AlbumStatusFilter = (typeof AlbumStatusFilter)[keyof typeof AlbumStatusFilter];

export interface AlbumFilters {
  readonly category: "ALL" | StickerCategory;
  readonly rarity: "ALL" | StickerRarity;
  readonly era: "ALL" | StickerEra;
  readonly status: AlbumStatusFilter;
  readonly search: string;
}

const DEFAULT_FILTERS: AlbumFilters = {
  category: "ALL",
  rarity: "ALL",
  era: "ALL",
  status: AlbumStatusFilter.ALL,
  search: "",
};

export function useAlbumFilters(albumStickers: readonly AlbumStickerView[]) {
  const [filters, setFilters] = useState<AlbumFilters>(DEFAULT_FILTERS);
  const deferredSearch = useDeferredValue(filters.search.trim().toLowerCase());

  const filteredStickers = useMemo(
    () =>
      albumStickers.filter((albumSticker) => {
        const { sticker } = albumSticker;
        const matchesCategory = filters.category === "ALL" || sticker.category === filters.category;
        const matchesRarity = filters.rarity === "ALL" || sticker.rarity === filters.rarity;
        const matchesEra = filters.era === "ALL" || sticker.era === filters.era;
        const matchesStatus =
          filters.status === AlbumStatusFilter.ALL ||
          statusMatches(albumSticker.status, filters.status);
        const matchesSearch =
          deferredSearch.length === 0 ||
          sticker.title.toLowerCase().includes(deferredSearch) ||
          sticker.description.toLowerCase().includes(deferredSearch) ||
          sticker.tags.some((tag) => tag.toLowerCase().includes(deferredSearch));

        return matchesCategory && matchesRarity && matchesEra && matchesStatus && matchesSearch;
      }),
    [albumStickers, deferredSearch, filters.category, filters.era, filters.rarity, filters.status],
  );

  function updateFilter<K extends keyof AlbumFilters>(key: K, value: AlbumFilters[K]): void {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }));
  }

  function resetFilters(): void {
    setFilters(DEFAULT_FILTERS);
  }

  return {
    filters,
    filteredStickers,
    updateFilter,
    resetFilters,
  };
}

function statusMatches(status: AlbumStickerView["status"], filter: AlbumStatusFilter): boolean {
  switch (filter) {
    case AlbumStatusFilter.COLLECTED:
      return (
        status === AlbumStickerStatus.COLLECTED ||
        status === AlbumStickerStatus.PASTED ||
        status === AlbumStickerStatus.REPEATED
      );
    case AlbumStatusFilter.PASTED:
      return status === AlbumStickerStatus.PASTED || status === AlbumStickerStatus.REPEATED;
    case AlbumStatusFilter.MISSING:
      return status === AlbumStickerStatus.MISSING;
    case AlbumStatusFilter.REPEATED:
      return status === AlbumStickerStatus.REPEATED;
    case AlbumStatusFilter.ALL:
      return true;
  }
}
