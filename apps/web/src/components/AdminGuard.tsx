import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { useAuth } from "../features/auth/useAuth";
import { LoadingScreen } from "./LoadingScreen";

export function AdminGuard({ children }: { readonly children: ReactNode }): React.JSX.Element {
  const { user } = useAuth();
  const [loadingClaim, setLoadingClaim] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!user) {
      setIsAdmin(false);
      setLoadingClaim(false);
      return;
    }

    setLoadingClaim(true);

    void user
      .getIdTokenResult()
      .then((tokenResult) => {
        if (mounted) {
          setIsAdmin(tokenResult.claims.admin === true);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsAdmin(false);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingClaim(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  if (loadingClaim) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return (
      <main className="page admin-page">
        <section className="state-message">
          No tenes permisos de administrador para ver esta seccion.
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
