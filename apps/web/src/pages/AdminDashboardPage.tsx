export function AdminDashboardPage(): React.JSX.Element {
  return (
    <main className="page admin-page">
      <section className="admin-hero">
        <p className="eyebrow">Admin MVP</p>
        <h1>Panel admin pendiente</h1>
        <p>
          Panel admin pendiente de habilitacion en backend Node. El MVP jugable sigue usando Render
          para reclamar sobres, abrir sobres y pegar figuritas.
        </p>
      </section>

      <section className="admin-section">
        <p className="eyebrow">Decision PR19</p>
        <h2>Diferido despues del MVP jugable</h2>
        <p className="state-message compact">
          La version anterior dependia de Cloud Functions y no corre en Firebase Spark-only. Cuando
          se habilite, debe ser GET /api/admin/dashboard en Backend Node, con Firebase ID token y
          custom claim admin igual a true verificado del lado servidor.
        </p>
      </section>
    </main>
  );
}
