import { useState } from "react";

import { useAuth } from "../features/auth/useAuth";

interface SignOutButtonProps {
  readonly compact?: boolean;
}

export function SignOutButton({ compact = false }: SignOutButtonProps): React.JSX.Element {
  const { signOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick(): Promise<void> {
    setSubmitting(true);

    try {
      await signOut();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      className={compact ? "ghost-button compact" : "ghost-button"}
      disabled={submitting}
      type="button"
      onClick={handleClick}
    >
      {submitting ? "Saliendo..." : "Cerrar sesion"}
    </button>
  );
}
