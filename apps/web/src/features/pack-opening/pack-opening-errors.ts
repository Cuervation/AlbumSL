import { FirebaseError } from "firebase/app";

import { AlbumslApiError } from "../../lib/albumsl-api";

export function getPackOpeningErrorMessage(error: unknown): string {
  if (error instanceof AlbumslApiError) {
    switch (error.code) {
      case "UNAUTHENTICATED":
        return "Necesitas iniciar sesion para reclamar o abrir sobres.";
      case "PERMISSION_DENIED":
        return "Ese sobre no pertenece a tu usuario.";
      case "INVALID_ARGUMENT":
        return "La solicitud del sobre no es valida.";
      case "ALREADY_CLAIMED":
      case "CLAIM_EXPIRED":
      case "CLAIM_ALREADY_CONSUMED":
      case "PACK_NOT_AVAILABLE":
        return "El claim ya fue usado, expiro o no esta disponible.";
      default:
        return "No pudimos completar la operacion del sobre. Proba de nuevo.";
    }
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "functions/unauthenticated":
        return "Necesitas iniciar sesion para reclamar o abrir sobres.";
      case "functions/permission-denied":
        return "Ese sobre no pertenece a tu usuario.";
      case "functions/not-found":
        return "No encontramos un claim valido para abrir este sobre.";
      case "functions/failed-precondition":
        return "El claim ya fue usado, expiro o no esta disponible.";
      case "functions/invalid-argument":
        return "La solicitud del sobre no es valida.";
      default:
        return "No pudimos completar la operacion del sobre. Proba de nuevo.";
    }
  }

  return "Ocurrio un error inesperado con el sobre.";
}
