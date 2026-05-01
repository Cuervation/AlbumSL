import type { AdminDashboardResponseDto } from "@albumsl/contracts";
import { useCallback, useEffect, useState } from "react";

import { getAdminErrorMessage } from "./admin-errors";
import { getAdminDashboard } from "./admin.service";

export interface AdminDashboardState {
  readonly dashboard: AdminDashboardResponseDto | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
}

export function useAdminDashboard(enabled: boolean): AdminDashboardState {
  const [dashboard, setDashboard] = useState<AdminDashboardResponseDto | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!enabled) {
      setDashboard(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setDashboard(await getAdminDashboard());
    } catch (caughtError) {
      setDashboard(null);
      setError(getAdminErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    dashboard,
    loading,
    error,
    refresh,
  };
}
