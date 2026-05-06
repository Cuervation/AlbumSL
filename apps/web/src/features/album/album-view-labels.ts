import { AlbumStickerStatus, type AlbumStickerView } from "@albumsl/domain";

export function getAlbumStatusLabel(status: AlbumStickerView["status"]): string {
  switch (status) {
    case AlbumStickerStatus.MISSING:
      return "Falta";
    case AlbumStickerStatus.COLLECTED:
      return "Disponible";
    case AlbumStickerStatus.PASTED:
      return "Pegada";
    case AlbumStickerStatus.REPEATED:
      return "Repetida";
  }
}

export function getAlbumStatusClassName(status: AlbumStickerView["status"]): string {
  switch (status) {
    case AlbumStickerStatus.MISSING:
      return "missing";
    case AlbumStickerStatus.COLLECTED:
      return "collected";
    case AlbumStickerStatus.PASTED:
      return "pasted";
    case AlbumStickerStatus.REPEATED:
      return "repeated";
  }
}
