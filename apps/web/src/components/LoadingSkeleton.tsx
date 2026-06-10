const CARD_SKELETONS = Array.from({ length: 6 }, (_, index) => index);
const ALBUM_SLOT_SKELETONS = Array.from({ length: 6 }, (_, index) => index);
const DETAIL_STAT_SKELETONS = Array.from({ length: 6 }, (_, index) => index);

export function AppLoadingSkeleton(): React.JSX.Element {
  return (
    <main className="skeleton-screen" role="status" aria-label="Preparando AlbumSL">
      <div className="skeleton-screen-header">
        <Skeleton className="skeleton-line skeleton-line--brand" />
        <Skeleton className="skeleton-line skeleton-line--short" />
      </div>
      <div className="skeleton-screen-grid">
        {CARD_SKELETONS.slice(0, 3).map((item) => (
          <Skeleton key={item} className="skeleton-screen-card" />
        ))}
      </div>
    </main>
  );
}

export function AlbumLoadingSkeleton(): React.JSX.Element {
  return (
    <section className="album-loading-skeleton" role="status" aria-label="Preparando tu álbum">
      <div className="album-loading-book">
        <AlbumSkeletonPage />
        <div className="album-loading-spine" aria-hidden="true" />
        <AlbumSkeletonPage />
      </div>
      <div className="album-loading-nav" aria-hidden="true">
        <Skeleton className="skeleton-circle" />
        <Skeleton className="skeleton-line skeleton-line--page" />
        <Skeleton className="skeleton-circle" />
      </div>
    </section>
  );
}

export function CardGridLoadingSkeleton(): React.JSX.Element {
  return (
    <section
      className="duplicates-grid skeleton-card-grid"
      role="status"
      aria-label="Preparando tus repetidas"
    >
      {CARD_SKELETONS.map((item) => (
        <div key={item} className="skeleton-card">
          <Skeleton className="skeleton-card-art" />
          <Skeleton className="skeleton-line skeleton-line--medium" />
          <Skeleton className="skeleton-line skeleton-line--short" />
        </div>
      ))}
    </section>
  );
}

export function StickerDetailLoadingSkeleton(): React.JSX.Element {
  return (
    <section
      className="sticker-detail skeleton-detail"
      role="status"
      aria-label="Preparando la figurita"
    >
      <Skeleton className="skeleton-detail-art" />
      <div className="skeleton-detail-body">
        <Skeleton className="skeleton-line skeleton-line--short" />
        <Skeleton className="skeleton-line skeleton-line--title" />
        <Skeleton className="skeleton-line" />
        <Skeleton className="skeleton-line skeleton-line--medium" />
        <div className="skeleton-detail-stats">
          {DETAIL_STAT_SKELETONS.map((item) => (
            <Skeleton key={item} className="skeleton-detail-stat" />
          ))}
        </div>
      </div>
    </section>
  );
}

function AlbumSkeletonPage(): React.JSX.Element {
  return (
    <div className="album-loading-page" aria-hidden="true">
      <div className="album-loading-page-header">
        <Skeleton className="skeleton-line skeleton-line--medium" />
        <Skeleton className="skeleton-line skeleton-line--short" />
      </div>
      <div className="album-loading-slots">
        {ALBUM_SLOT_SKELETONS.map((item) => (
          <Skeleton key={item} className="album-loading-slot" />
        ))}
      </div>
    </div>
  );
}

function Skeleton({ className }: { readonly className: string }): React.JSX.Element {
  return <span className={`skeleton ${className}`} aria-hidden="true" />;
}
