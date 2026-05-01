import { useState } from "react";

import { useAuth } from "../features/auth/useAuth";

export function SignInButton(): React.JSX.Element {
  const { signInWithGoogle, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick(): Promise<void> {
    setSubmitting(true);

    try {
      await signInWithGoogle();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      className="primary-button"
      disabled={loading || submitting}
      type="button"
      onClick={handleClick}
    >
      {submitting ? "Abriendo Google..." : "Ingresar con Google"}
    </button>
  );
}
