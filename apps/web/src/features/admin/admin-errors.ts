export function getAdminErrorMessage(error: unknown): string {
  if (isFirebaseError(error)) {
    if (error.code === "functions/unauthenticated") {
      return "Necesitas iniciar sesion para acceder al panel admin.";
    }

    if (error.code === "functions/permission-denied") {
      return "No tenes permisos de administrador para ver esta seccion.";
    }

    return "No pudimos cargar el panel admin. Intenta nuevamente.";
  }

  return "Ocurrio un error inesperado en el panel admin.";
}

function isFirebaseError(error: unknown): error is { readonly code: string } {
  return (
    typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
  );
}
