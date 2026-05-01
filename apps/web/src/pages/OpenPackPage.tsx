import type { PackStickerResultDto } from "@albumsl/contracts";

import { useDailyPack } from "../features/pack-opening/useDailyPack";
import { useOpenPack } from "../features/pack-opening/useOpenPack";

export function OpenPackPage(): React.JSX.Element {
  const dailyPack = useDailyPack();
  const packOpening = useOpenPack();
  const canOpenDailyPack = dailyPack.claim?.status === "AVAILABLE";

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
      <section className="open-pack-hero">
        <p className="eyebrow">Sobres</p>
        <h1>Sobre diario</h1>
        <p>
          Reclama tu sobre diario y abrilo desde backend. La UI solo manda la intencion: las 5
          figuritas se deciden en Cloud Functions usando los casos de uso.
        </p>
      </section>

      <section className="pack-actions-card">
        <div>
          <h2>Claim diario</h2>
          <p>
            {dailyPack.claim
              ? `Claim ${dailyPack.claim.status.toLowerCase()} hasta ${formatDate(
                  dailyPack.claim.expiresAt,
                )}.`
              : "Todavia no reclamaste un sobre diario en esta sesion."}
          </p>
        </div>

        <div className="pack-actions">
          <button
            type="button"
            onClick={() => void dailyPack.claimDaily()}
            disabled={dailyPack.loading}
          >
            {dailyPack.loading ? "Reclamando..." : "Reclamar sobre diario"}
          </button>
          <button
            type="button"
            onClick={() => void handleOpenDailyPack()}
            disabled={!canOpenDailyPack || packOpening.loading}
          >
            {packOpening.loading ? "Abriendo..." : "Abrir sobre"}
          </button>
        </div>

        {dailyPack.error ? <p className="error-message">{dailyPack.error}</p> : null}
        {packOpening.error ? <p className="error-message">{packOpening.error}</p> : null}
      </section>

      {packOpening.result ? (
        <section className="pack-result-section" aria-label="Resultado del sobre">
          <div className="catalog-header">
            <div>
              <p className="eyebrow">Resultado</p>
              <h2>Figuritas obtenidas</h2>
            </div>
            <p>
              Nuevas: {packOpening.result.newCount} · Repetidas: {packOpening.result.repeatedCount}
            </p>
          </div>

          <div className="pack-sticker-grid">
            {packOpening.result.stickers.map((sticker, index) => (
              <PackStickerCard key={`${sticker.stickerId}-${index}`} sticker={sticker} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function PackStickerCard({
  sticker,
}: {
  readonly sticker: PackStickerResultDto;
}): React.JSX.Element {
  return (
    <article className="pack-sticker-card">
      <div className="sticker-placeholder" aria-hidden="true">
        #{sticker.number}
      </div>
      <div>
        <span className={sticker.isNew ? "sticker-badge new" : "sticker-badge repeated"}>
          {sticker.isNew ? "Nueva" : "Repetida"}
        </span>
        <h3>{sticker.title}</h3>
        <p>
          {sticker.category} · {sticker.rarity}
        </p>
        <p>Cantidad ahora: {sticker.quantityAfter}</p>
      </div>
    </article>
  );
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
