import { canPasteSticker, type AlbumStickerView } from "@albumsl/domain";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AlbumHomeHeader } from "../components/home/AlbumHomeHeader";
import {
  ExchangeStickerTray,
  StickerDropTarget,
  StickerInventoryCard,
  StickerLibrarySkeleton,
  StickerLibrarySummary,
} from "../components/sticker-library/StickerLibrary";
import { useAlbumData } from "../features/album/useAlbumData";
import { useAuth } from "../features/auth/useAuth";
import {
  getExchangeableQuantity,
  isExchangeableSticker,
} from "../features/sticker-library/sticker-library-model";

const MAX_EXCHANGE_STICKERS = 3;

export function DuplicatesPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { user, currentUserProfile } = useAuth();
  const { albumStickers, loading, error, refresh } = useAlbumData();
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [exchangeStickerIds, setExchangeStickerIds] = useState<readonly string[]>([]);
  const [interactionMessage, setInteractionMessage] = useState<string | null>(null);

  const ownedStickers = albumStickers.filter((albumSticker) => albumSticker.isCollected);
  const selectedSticker =
    ownedStickers.find((albumSticker) => albumSticker.sticker.id === selectedStickerId) ?? null;
  const exchangeStickers = exchangeStickerIds.flatMap((stickerId) => {
    const albumSticker = ownedStickers.find((item) => item.sticker.id === stickerId);
    return albumSticker ? [albumSticker] : [];
  });
  const availableToPasteCount = ownedStickers.filter(isAvailableToPaste).length;
  const exchangeableCopies = ownedStickers.reduce(
    (total, albumSticker) => total + getExchangeableQuantity(albumSticker),
    0,
  );
  const totalCopies = ownedStickers.reduce(
    (total, albumSticker) => total + (albumSticker.userSticker?.quantity ?? 0),
    0,
  );
  const displayName = currentUserProfile?.displayName ?? user?.displayName ?? "Cuervo";

  function findSticker(stickerId: string): AlbumStickerView | null {
    return ownedStickers.find((item) => item.sticker.id === stickerId) ?? null;
  }

  function openStickerAlbumPage(stickerId: string): void {
    const albumSticker = findSticker(stickerId);

    if (!albumSticker || !isAvailableToPaste(albumSticker)) {
      setInteractionMessage("Esa figurita ya está pegada y no tiene otra copia disponible.");
      return;
    }

    navigate(`/album?sticker=${encodeURIComponent(stickerId)}`);
  }

  function addStickerToExchange(stickerId: string): void {
    const albumSticker = findSticker(stickerId);

    if (!albumSticker || !isExchangeableSticker(albumSticker)) {
      setInteractionMessage("Para intercambio necesitás una copia repetida de esa figurita.");
      return;
    }

    if (exchangeStickerIds.includes(stickerId)) {
      setInteractionMessage("Esa figurita ya está en la bandeja de intercambio.");
      return;
    }

    if (exchangeStickerIds.length >= MAX_EXCHANGE_STICKERS) {
      setInteractionMessage(`Podés preparar hasta ${MAX_EXCHANGE_STICKERS} figuritas por vez.`);
      return;
    }

    setExchangeStickerIds((currentIds) => [...currentIds, stickerId]);
    setSelectedStickerId(null);
    setInteractionMessage("Figurita agregada a la bandeja. Seguís en Mis cromos.");
  }

  function handleTargetActivation(target: "album" | "exchange"): void {
    if (!selectedSticker) {
      setInteractionMessage("Primero seleccioná una figurita de tu colección.");
      return;
    }

    if (target === "album") {
      openStickerAlbumPage(selectedSticker.sticker.id);
      return;
    }

    addStickerToExchange(selectedSticker.sticker.id);
  }

  return (
    <main className="sticker-library-page">
      <section className="sticker-library-shell" aria-labelledby="sticker-library-title">
        <AlbumHomeHeader
          displayName={displayName}
          email={currentUserProfile?.email ?? user?.email ?? null}
          photoURL={currentUserProfile?.photoURL ?? user?.photoURL ?? null}
          authenticated={user !== null}
        />

        <header className="sticker-library-heading">
          <div>
            <p className="sticker-library-eyebrow">Tu colección, tu historia</p>
            <h1 id="sticker-library-title">Mis cromos</h1>
            <p>
              Arrastrá una figurita al álbum para abrir su hoja o dejala en la bandeja de
              intercambio.
            </p>
          </div>
          <button
            type="button"
            className="sticker-library-refresh"
            onClick={() => void refresh()}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar colección"}
          </button>
        </header>

        {loading ? (
          <StickerLibrarySkeleton />
        ) : (
          <>
            <StickerLibrarySummary
              availableToPaste={availableToPasteCount}
              repeated={exchangeableCopies}
              exchangeCount={exchangeStickerIds.length}
              totalCopies={totalCopies}
            />

            {error ? (
              <p className="sticker-library-message sticker-library-message--error" role="alert">
                {error}
              </p>
            ) : null}
            {interactionMessage ? (
              <p className="sticker-library-message" role="status">
                {interactionMessage}
              </p>
            ) : null}

            {!error && ownedStickers.length === 0 ? (
              <section className="sticker-library-empty">
                <strong>Todavía no tenés cromos.</strong>
                <span>Abrí un sobre para empezar tu colección.</span>
              </section>
            ) : null}

            {!error && ownedStickers.length > 0 ? (
              <div className="sticker-library-workspace">
                <section
                  className="sticker-inventory-panel"
                  aria-labelledby="sticker-inventory-title"
                >
                  <div className="sticker-inventory-heading">
                    <div>
                      <h2 id="sticker-inventory-title">Tu colección</h2>
                      <p>Seleccioná o arrastrá una figurita.</p>
                    </div>
                    <strong>{ownedStickers.length} diseños</strong>
                  </div>

                  <div className="sticker-inventory-grid">
                    {ownedStickers.map((albumSticker) => (
                      <StickerInventoryCard
                        key={albumSticker.sticker.id}
                        albumSticker={albumSticker}
                        selected={selectedStickerId === albumSticker.sticker.id}
                        onSelect={() => {
                          setSelectedStickerId((currentId) =>
                            currentId === albumSticker.sticker.id ? null : albumSticker.sticker.id,
                          );
                          setInteractionMessage(null);
                        }}
                      />
                    ))}
                  </div>
                </section>

                <aside className="sticker-library-sidebar" aria-label="Destinos de figuritas">
                  <StickerDropTarget
                    title="Abrir hoja"
                    description="Abre el álbum directamente en la hoja donde corresponde."
                    actionLabel="Abrir hoja seleccionada"
                    icon="album"
                    selectedSticker={selectedSticker}
                    onDropSticker={openStickerAlbumPage}
                    onActivate={() => handleTargetActivation("album")}
                  />

                  <ExchangeStickerTray
                    selectedStickers={exchangeStickers}
                    activeSticker={selectedSticker}
                    maxStickers={MAX_EXCHANGE_STICKERS}
                    onDropSticker={addStickerToExchange}
                    onActivate={() => handleTargetActivation("exchange")}
                    onRemove={(stickerId) =>
                      setExchangeStickerIds((currentIds) =>
                        currentIds.filter((currentId) => currentId !== stickerId),
                      )
                    }
                  />
                </aside>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}

function isAvailableToPaste(albumSticker: AlbumStickerView): boolean {
  return albumSticker.userSticker ? canPasteSticker(albumSticker.userSticker) : false;
}
