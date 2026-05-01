import { FirebaseError } from "firebase/app";

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === "auth/popup-closed-by-user") {
      return "El inicio de sesion fue cancelado.";
    }

    if (error.code === "auth/popup-blocked") {
      return "El navegador bloqueo la ventana de Google. Habilitala para continuar.";
    }

    if (error.code === "auth/cancelled-popup-request") {
      return "Ya hay una ventana de inicio de sesion abierta.";
    }

    if (error.code === "permission-denied") {
      return "No tenes permisos para acceder a esa informacion.";
    }

    if (error.code.startsWith("firestore/") || error.code === "unavailable") {
      return "No pudimos cargar tu perfil. Intentá de nuevo en unos segundos.";
    }
  }

  return "Ocurrio un error inesperado. Intentá nuevamente.";
}
