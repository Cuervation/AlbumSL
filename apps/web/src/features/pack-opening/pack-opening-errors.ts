import { FirebaseError } from "firebase/app";

export function getPackOpeningErrorMessage(error: unknown): string {
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
