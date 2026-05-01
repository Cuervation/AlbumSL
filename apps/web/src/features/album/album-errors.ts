import { FirebaseError } from "firebase/app";

export function getAlbumErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "functions/unauthenticated":
        return "Necesitas iniciar sesion para ver o modificar tu album.";
      case "functions/permission-denied":
        return "No tenes permiso para modificar esta figurita.";
      case "functions/failed-precondition":
        return "No tenes una figurita disponible para pegar.";
      case "functions/not-found":
        return "No encontramos esa figurita en tu coleccion.";
      case "functions/invalid-argument":
        return "La solicitud no es valida.";
      default:
        return "No pudimos cargar o actualizar el album. Proba de nuevo.";
    }
  }

  return "Ocurrio un error inesperado con el album.";
}
