import { useContext } from "react";

import type { AuthContextValue } from "./AuthProvider";
import { AuthContext } from "./auth-context";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
