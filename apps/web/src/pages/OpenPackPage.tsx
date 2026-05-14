import type { ClaimDailyPackResponseDto, OpenPackResponseDto } from "@albumsl/contracts";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { StickerCatalogCard } from "../components/StickerCatalogCard";
import { useDailyPack } from "../features/pack-opening/useDailyPack";
import { useOpenPack } from "../features/pack-opening/useOpenPack";
import { isPreviewMode } from "../features/preview/preview-mode";

export function OpenPackPage(): React.JSX.Element {
  const navigate = useNavigate();
  const dailyPack = useDailyPack();
  const packOpening = useOpenPack();
  const openingTimeoutRef = useRef<number | null>(null);
  const [isEnvelopeOpening, setIsEnvelopeOpening] = useState(false);
  const [revealedPackResult, setRevealedPackResult] = useState<OpenPackResponseDto | null>(null);
  const previewMode = isPreviewMode();
  const isBusy = dailyPack.loading || packOpening.loading;
  const claimVisualState = getClaimVisualState(dailyPack.claim);
  const packEnvelopeState = getPackEnvelopeState(dailyPack.claim, isEnvelopeOpening || packOpening.loading);
  const packEnvelopeLabel = getPackEnvelopeLabel(packEnvelopeState);
  const canOpenAnother = !isBusy && revealedPackResult !== null && dailyPack.claim?.status === "AVAILABLE";

  useEffect(() => {
    if (!packOpening.result) {
      setRevealedPackResult(null);
      return;
    }

    setRevealedPackResult(null);
    const timeoutId = window.setTimeout(() => {
      setRevealedPackResult(packOpening.result);
    }, 680);

    return () => window.clearTimeout(timeoutId);
  }, [packOpening.result]);

  useEffect(() => {
    return () => {
      if (openingTimeoutRef.current !== null) {
        window.clearTimeout(openingTimeoutRef.current);
      }
    };
  }, []);

  async function handleOpenDailyPack(): Promise<void> {
    const claim =
      dailyPack.claim?.status === "AVAILABLE" ? dailyPack.claim : await dailyPack.claimDaily();

    if (!claim || claim.status !== "AVAILABLE") {
      return;
    }

    if (openingTimeoutRef.current !== null) {
      window.clearTimeout(openingTimeoutRef.current);
    }

    setIsEnvelopeOpening(true);

    const result = await packOpening.open(claim.source, claim.claimId);

    openingTimeoutRef.current = window.setTimeout(() => {
      setIsEnvelopeOpening(false);
      openingTimeoutRef.current = null;
    }, 760);

    if (result) {
      dailyPack.setClaim(
        previewMode
          ? {
              ...claim,
              status: "AVAILABLE",
            }
          : {
              ...claim,
              status: "CONSUMED",
            },
      );
    }
  }

  async function handleOpenAnother(): Promise<void> {
    packOpening.reset();
    setRevealedPackResult(null);
    await handleOpenDailyPack();
  }

  return (
    <main className="page open-pack-page experience-open-pack app-experience-shell">
      <div className="pack-modal-backdrop" aria-hidden="true" />
      <section
        className={`pack-modal pack-actions-card pack-stand pack-actions-card--${packEnvelopeState} ${
          revealedPackResult ? "pack-modal--has-result" : ""
        }`}
        aria-label="Modal de sobre diario"
        role="dialog"
        aria-modal="true"
      >
        <div className="pack-modal-header">
          <div className="open-pack-hero-copy">
            <p className="eyebrow">Sobres</p>
            <h1>Sobre diario azulgrana</h1>
            <p>Abrilo y mirá salir las figuritas dentro del mismo modal.</p>
          </div>
          <button type="button" className="ghost-button compact" onClick={() => navigate("/album")}>
            Cerrar
          </button>
        </div>

        <aside className={`claim-badge claim-badge--${claimVisualState.variant}`}>
          <span className="claim-badge-label">Estado del sobre</span>
          <strong>{claimVisualState.title}</strong>
          <p>{claimVisualState.description}</p>
        </aside>

        <div className={`daily-pack-stage daily-pack-stage--${packEnvelopeState}`} aria-hidden="true">
          <span className="pack-object-shadow" />
          <div className={`daily-pack-visual daily-pack-visual--${packEnvelopeState}`}>
            <span className="daily-pack-visual-flap" />
            <span className="daily-pack-visual-body" />
            <span className="daily-pack-visual-mouth" />
            <span className="daily-pack-visual-rip" />
            <span className="daily-pack-visual-seal">SL</span>
            <span className="daily-pack-visual-shine" />
          </div>
          <span className="pack-opening-burst" />
          <span className="pack-opening-spark pack-opening-spark--one" />
          <span className="pack-opening-spark pack-opening-spark--two" />
          <span className="pack-flying-card pack-flying-card--one" />
          <span className="pack-flying-card pack-flying-card--two" />
          <span className="daily-pack-visual-label">{packEnvelopeLabel}</span>
        </div>

        {!revealedPackResult ? (
          <>
            <div className="pack-actions-copy">
              <h2>Sobre diario</h2>
              <p aria-live="polite" role="status">
                {getClaimStateMessage(dailyPack.claim)}
              </p>
            </div>

            <div className="pack-actions pack-actions--single">
              <button type="button" onClick={() => void handleOpenDailyPack()} disabled={isBusy}>
                {packOpening.loading ? "Abriendo..." : "Abrir sobre"}
              </button>
            </div>
          </>
        ) : null}

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

        {revealedPackResult ? (
          <section
            className="pack-result-section pack-result-section--visible"
            aria-label="Resultado del sobre"
          >
            <div className="pack-result-summary">
              <div>
                <p className="eyebrow">Resultado</p>
                <h2>Tus figuritas</h2>
              </div>
              <div className="pack-result-summary-actions">
                <div className="pack-result-metrics" aria-label="Resumen del sobre">
                  <span>
                    Nuevas <strong>{revealedPackResult.newCount}</strong>
                  </span>
                  <span>
                    Repetidas <strong>{revealedPackResult.repeatedCount}</strong>
                  </span>
                </div>
                {canOpenAnother ? (
                  <button type="button" className="ghost-button" onClick={() => void handleOpenAnother()}>
                    {previewMode ? "Abrir otro sobre" : "Abrir siguiente sobre"}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="pack-sticker-grid">
              {revealedPackResult.stickers.map((sticker, index) => (
                <article
                  className={`pack-result-sticker ${
                    sticker.isNew ? "pack-result-sticker--new" : "pack-result-sticker--repeated"
                  }`}
                  key={`${sticker.stickerId}-${index}`}
                  style={getStickerFlightStyle(index)}
                >
                  <span className="pack-result-sticker-badge">
                    {sticker.isNew ? "Nueva" : "Repetida"}
                  </span>
                  <StickerCatalogCard sticker={sticker} />
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function getPackEnvelopeState(
  claim: ClaimDailyPackResponseDto | null,
  isOpening: boolean,
): "idle" | "ready" | "opening" | "opened" {
  if (isOpening) {
    return "opening";
  }

  if (claim?.status === "AVAILABLE") {
    return "ready";
  }

  if (claim?.status === "CONSUMED") {
    return "opened";
  }

  return "idle";
}

function getPackEnvelopeLabel(state: "idle" | "ready" | "opening" | "opened"): string {
  if (state === "ready") {
    return "Sobre disponible";
  }

  if (state === "opening") {
    return "Abriendo sobre";
  }

  if (state === "opened") {
    return "Sobre abierto";
  }

  return "Sin reclamar";
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
      title: "Reclama tu sobre",
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

function getStickerFlightStyle(index: number): React.CSSProperties {
  const presets = [
    { delay: "20ms", x: "132px", y: "-182px", rotation: "-18deg" },
    { delay: "150ms", x: "96px", y: "-170px", rotation: "-10deg" },
    { delay: "280ms", x: "60px", y: "-156px", rotation: "-2deg" },
    { delay: "410ms", x: "28px", y: "-144px", rotation: "8deg" },
    { delay: "540ms", x: "4px", y: "-130px", rotation: "14deg" },
  ] as const;

  const preset = presets[index % presets.length] ?? presets[0];

  return {
    "--pack-sticker-delay": preset.delay,
    "--pack-sticker-start-x": preset.x,
    "--pack-sticker-start-y": preset.y,
    "--pack-sticker-rotation": preset.rotation,
  } as React.CSSProperties;
}

