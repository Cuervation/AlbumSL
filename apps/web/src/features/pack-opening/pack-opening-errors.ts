import { FirebaseError } from "firebase/app";

import { AlbumslApiError } from "../../lib/albumsl-api";

export function getPackOpeningErrorMessage(error: unknown): string {
  if (error instanceof AlbumslApiError) {
    switch (error.code) {
      case "UNAUTHENTICATED":
        return "Tu sesion vencio o no esta disponible. Volve a iniciar sesion e intenta de nuevo.";
      case "PERMISSION_DENIED":
      case "INVALID_CLAIM":
        return "No encontramos un sobre disponible para abrir. Reclama tu sobre diario otra vez si corresponde.";
      case "INVALID_ARGUMENT":
        return "No pudimos preparar el sobre. Actualiza la pagina e intenta de nuevo.";
      case "ALREADY_CLAIMED":
        return "Ya reclamaste tu sobre diario. Si esta disponible, podes abrirlo ahora.";
      case "CLAIM_EXPIRED":
        return "Ese sobre vencio. Reclama uno nuevo cuando este disponible.";
      case "CLAIM_ALREADY_CONSUMED":
        return "Ese sobre ya fue abierto.";
      case "PACK_NOT_AVAILABLE":
        return "El sobre no esta disponible en este momento.";
      case "NO_ACTIVE_STICKERS":
        return "Todavia no hay figuritas activas para abrir sobres.";
      default:
        return "No pudimos completar la operacion del sobre. Espera un momento y proba de nuevo.";
    }
  }

  if (error instanceof TypeError) {
    return "No pudimos conectar con el servidor de AlbumSL. Revisa tu conexion e intenta de nuevo.";
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "functions/unauthenticated":
        return "Tu sesion vencio o no esta disponible. Volve a iniciar sesion e intenta de nuevo.";
      case "functions/permission-denied":
        return "No encontramos un sobre disponible para abrir. Reclama tu sobre diario otra vez si corresponde.";
      case "functions/not-found":
        return "No encontramos un claim valido para abrir este sobre.";
      case "functions/failed-precondition":
        return "Ese sobre ya fue usado, vencio o no esta disponible.";
      case "functions/invalid-argument":
        return "No pudimos preparar el sobre. Actualiza la pagina e intenta de nuevo.";
      default:
        return "No pudimos completar la operacion del sobre. Espera un momento y proba de nuevo.";
    }
  }

  return "No pudimos completar la operacion del sobre. Espera un momento y proba de nuevo.";
}
