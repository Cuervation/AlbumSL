import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../features/auth/useAuth";
import { LoadingScreen } from "./LoadingScreen";

export function AuthGuard({ children }: { readonly children: ReactNode }): React.JSX.Element {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <>{children}</>;
}
