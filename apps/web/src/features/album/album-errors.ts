import { FirebaseError } from "firebase/app";

import { AlbumslApiError } from "../../lib/albumsl-api";

export function getAlbumErrorMessage(error: unknown): string {
  if (error instanceof AlbumslApiError) {
    switch (error.code) {
      case "UNAUTHENTICATED":
        return "Tu sesion vencio o no esta disponible. Volve a iniciar sesion e intenta de nuevo.";
      case "PERMISSION_DENIED":
        return "No tenes permiso para modificar esta figurita.";
      case "INSUFFICIENT_QUANTITY":
        return "No tenes una figurita disponible para pegar.";
      case "STICKER_NOT_FOUND":
        return "No encontramos esa figurita en tu coleccion.";
      case "INVALID_ARGUMENT":
        return "No pudimos preparar la accion. Actualiza la pagina e intenta de nuevo.";
      default:
        return "No pudimos cargar o actualizar el album. Espera un momento y proba de nuevo.";
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
        return "No tenes permiso para modificar esta figurita.";
      case "functions/failed-precondition":
        return "No tenes una figurita disponible para pegar.";
      case "functions/not-found":
        return "No encontramos esa figurita en tu coleccion.";
      case "functions/invalid-argument":
        return "La solicitud no es valida.";
      default:
        return "No pudimos cargar o actualizar el album. Espera un momento y proba de nuevo.";
    }
  }

  return "No pudimos cargar o actualizar el album. Espera un momento y proba de nuevo.";
}
