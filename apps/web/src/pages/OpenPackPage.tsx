import type { ClaimDailyPackResponseDto } from "@albumsl/contracts";

import { StickerCatalogCard } from "../components/StickerCatalogCard";
import { useDailyPack } from "../features/pack-opening/useDailyPack";
import { useOpenPack } from "../features/pack-opening/useOpenPack";

export function OpenPackPage(): React.JSX.Element {
  const dailyPack = useDailyPack();
  const packOpening = useOpenPack();
  const canOpenDailyPack = dailyPack.claim?.status === "AVAILABLE";
  const isBusy = dailyPack.loading || packOpening.loading;
  const claimVisualState = getClaimVisualState(dailyPack.claim);

  async function handleOpenDailyPack(): Promise<void> {
    if (!dailyPack.claim) {
      return;
    }

    const result = await packOpening.open(dailyPack.claim.source, dailyPack.claim.claimId);

    if (result) {
      dailyPack.setClaim({
        ...dailyPack.claim,
        status: "CONSUMED",
      });
    }
  }

  return (
    <main className="page open-pack-page">
      <section className="open-pack-hero open-pack-hero--featured">
        <div className="open-pack-hero-copy">
          <p className="eyebrow">Sobres</p>
          <h1>Sobre diario azulgrana</h1>
          <p>
            Reclama tu sobre diario, abrilo y sumale cinco figuritas a tu coleccion. AlbumSL valida
            la apertura antes de entregar el resultado.
          </p>
        </div>

        <aside className={`claim-badge claim-badge--${claimVisualState.variant}`}>
          <span className="claim-badge-label">Estado del sobre</span>
          <strong>{claimVisualState.title}</strong>
          <p>{claimVisualState.description}</p>
        </aside>
      </section>

      <section className="pack-actions-card">
        <div className="pack-actions-copy">
          <h2>Claim diario</h2>
          <p aria-live="polite" role="status">
            {getClaimStateMessage(dailyPack.claim)}
          </p>
        </div>

        <div className="pack-actions">
          <button type="button" onClick={() => void dailyPack.claimDaily()} disabled={isBusy}>
            {dailyPack.loading ? "Reclamando..." : "Reclamar sobre diario"}
          </button>
          <button
            type="button"
            onClick={() => void handleOpenDailyPack()}
            disabled={!canOpenDailyPack || isBusy}
          >
            {packOpening.loading ? "Abriendo..." : "Abrir sobre"}
          </button>
        </div>

        {dailyPack.error ? (
          <p className="error-message" role="alert">
            {dailyPack.error}
          </p>
        ) : null}
        {packOpening.error ? (
          <p className="error-message" role="alert">
            {packOpening.error}
          </p>
        ) : null}
      </section>

      {packOpening.result ? (
        <section className="pack-result-section" aria-label="Resultado del sobre">
          <div className="pack-result-summary">
            <div>
              <p className="eyebrow">Resultado</p>
              <h2>Figuritas obtenidas</h2>
            </div>
            <div className="pack-result-metrics" aria-label="Resumen del sobre">
              <span>
                Nuevas <strong>{packOpening.result.newCount}</strong>
              </span>
              <span>
                Repetidas <strong>{packOpening.result.repeatedCount}</strong>
              </span>
            </div>
          </div>

          <div className="pack-sticker-grid">
            {packOpening.result.stickers.map((sticker, index) => (
              <StickerCatalogCard key={`${sticker.stickerId}-${index}`} sticker={sticker} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function getClaimStateMessage(claim: ClaimDailyPackResponseDto | null): string {
  if (!claim) {
    return "Todavia no reclamaste tu sobre diario. Empeza por reclamarlo.";
  }

  if (claim.status === "AVAILABLE") {
    return `Tu sobre diario esta listo para abrir. Vence ${formatDate(claim.expiresAt)}.`;
  }

  if (claim.status === "CONSUMED") {
    return "Ya abriste el sobre diario. Volve cuando tengas otro disponible.";
  }

  return "El sobre diario no esta disponible en este momento.";
}

function getClaimVisualState(claim: ClaimDailyPackResponseDto | null): {
  readonly variant: "empty" | "available" | "consumed";
  readonly title: string;
  readonly description: string;
} {
  if (!claim) {
    return {
      variant: "empty",
      title: "Esperando claim",
      description: "Todavia no reclamaste el sobre de hoy.",
    };
  }

  if (claim.status === "AVAILABLE") {
    return {
      variant: "available",
      title: "Sobre listo",
      description: `Disponible hasta ${formatDate(claim.expiresAt)}.`,
    };
  }

  return {
    variant: "consumed",
    title: "Sobre consumido",
    description: "Ya fue abierto. Volve cuando haya otro disponible.",
  };
}

function formatDate(value: string | undefined): string {
  if (!value) {
    return "sin vencimiento";
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
