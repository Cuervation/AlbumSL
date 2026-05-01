import { AlbumStickerStatus, type AlbumStickerView } from "@albumsl/domain";

export function getAlbumStatusLabel(status: AlbumStickerView["status"]): string {
  switch (status) {
    case AlbumStickerStatus.MISSING:
      return "No conseguida";
    case AlbumStickerStatus.COLLECTED:
      return "Conseguida";
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
