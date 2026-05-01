import { Navigate } from "react-router-dom";

import { SignInButton } from "../components/SignInButton";
import { useAuth } from "../features/auth/useAuth";

export function LoginPage(): React.JSX.Element {
  const { user, error } = useAuth();

  if (user) {
    return <Navigate replace to="/dashboard" />;
  }

  return (
    <main className="page auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Acceso</p>
        <h1>Ingresar a AlbumSL</h1>
        <p>Usa tu cuenta de Google para crear o recuperar tu perfil inicial.</p>
        <SignInButton />
        {error ? <p className="error-message">{error}</p> : null}
      </section>
    </main>
  );
}
