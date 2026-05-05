import type { StickerEraDto, StickerRarityDto } from "@albumsl/contracts";

export interface StickerCatalogCardView {
  readonly number: number;
  readonly title: string;
  readonly imageUrl: string;
  readonly era: StickerEraDto;
  readonly rarity: StickerRarityDto;
  readonly tags: readonly string[];
}

export function StickerCatalogCard({
  sticker,
}: {
  readonly sticker: StickerCatalogCardView;
}): React.JSX.Element {
  return (
    <article className="sticker-card">
      <div className="sticker-card-art">
        {sticker.imageUrl.startsWith("placeholder://") ? (
          <span className="sticker-card-placeholder">#{sticker.number}</span>
        ) : (
          <img src={sticker.imageUrl} alt={sticker.title} loading="lazy" />
        )}
      </div>
      <span className="sticker-number">#{sticker.number}</span>
      <dl>
        <div>
          <dt>Epoca</dt>
          <dd>{getCatalogEraLabel(sticker.tags, sticker.imageUrl, sticker.era)}</dd>
        </div>
        <div>
          <dt>Rareza</dt>
          <dd>{sticker.rarity}</dd>
        </div>
      </dl>
    </article>
  );
}

function getCatalogEraLabel(tags: readonly string[], imageUrl: string, era: string): string {
  if (tags.includes("libertadores-2014")) {
    return "Libertadores 2014";
  }

  if (imageUrl.includes("/Libertadores_2014/")) {
    return "Libertadores 2014";
  }

  return era;
}
