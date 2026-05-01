import type { AdminRecentPackClaimDto, AdminRecentPackOpeningDto } from "@albumsl/contracts";

import { AdminMetricCard } from "../components/AdminMetricCard";
import { AdminTable } from "../components/AdminTable";
import { useAdminDashboard } from "../features/admin/useAdminDashboard";
import { useAuth } from "../features/auth/useAuth";

export function AdminDashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const { dashboard, error, loading } = useAdminDashboard(Boolean(user));

  return (
    <main className="page admin-page">
      <section className="admin-hero">
        <p className="eyebrow">Admin MVP</p>
        <h1>Panel de control</h1>
        <p>
          Vista solo lectura para monitorear catalogo, sobres y claims. Las acciones destructivas y
          la edicion quedan fuera del MVP.
        </p>
      </section>

      {loading ? <p className="state-message">Cargando metricas admin...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}

      {dashboard ? (
        <>
          <section className="admin-metrics" aria-label="Resumen general">
            <AdminMetricCard label="Usuarios" value={dashboard.totalUsers} />
            <AdminMetricCard label="Stickers" value={dashboard.totalStickers} />
            <AdminMetricCard label="Activas" value={dashboard.activeStickers} />
            <AdminMetricCard label="Inactivas" value={dashboard.inactiveStickers} />
            <AdminMetricCard label="Aperturas" value={dashboard.totalPackOpenings} />
            <AdminMetricCard label="Claims" value={dashboard.totalPackClaims} />
          </section>

          <section className="admin-section">
            <p className="eyebrow">Catalogo</p>
            <h2>Stickers activos/inactivos</h2>
            <div className="admin-split">
              <AdminMetricCard label="Activos" value={dashboard.activeStickers} />
              <AdminMetricCard label="Inactivos" value={dashboard.inactiveStickers} />
            </div>
          </section>

          <section className="admin-section">
            <p className="eyebrow">Auditoria funcional</p>
            <h2>Ultimas aperturas</h2>
            <AdminTable<AdminRecentPackOpeningDto>
              emptyMessage="No hay aperturas recientes."
              rows={dashboard.recentPackOpenings}
              columns={[
                { key: "id", label: "ID", render: (row) => row.id },
                { key: "userId", label: "Usuario", render: (row) => row.userId },
                { key: "source", label: "Fuente", render: (row) => row.source },
                { key: "newCount", label: "Nuevas", render: (row) => row.newCount },
                { key: "repeatedCount", label: "Repetidas", render: (row) => row.repeatedCount },
                { key: "createdAt", label: "Fecha", render: (row) => formatDate(row.createdAt) },
              ]}
            />
          </section>

          <section className="admin-section">
            <p className="eyebrow">Claims</p>
            <h2>Ultimos claims</h2>
            <AdminTable<AdminRecentPackClaimDto>
              emptyMessage="No hay claims recientes."
              rows={dashboard.recentPackClaims}
              columns={[
                { key: "id", label: "ID", render: (row) => row.id },
                { key: "userId", label: "Usuario", render: (row) => row.userId },
                { key: "source", label: "Fuente", render: (row) => row.source },
                { key: "status", label: "Estado", render: (row) => row.status },
                { key: "createdAt", label: "Fecha", render: (row) => formatDate(row.createdAt) },
              ]}
            />
          </section>

          <section className="admin-section">
            <p className="eyebrow">Usuarios</p>
            <h2>Usuarios recientes</h2>
            <p className="state-message compact">
              Por ahora se muestra solo el total. El listado reciente queda pendiente para evitar
              exponer emails u otros datos personales innecesarios.
            </p>
          </section>
        </>
      ) : null}
    </main>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
