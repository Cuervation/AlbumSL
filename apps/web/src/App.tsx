import "./styles.css";

export function App(): React.JSX.Element {
  return (
    <main className="app-shell">
      <section className="intro">
        <p className="eyebrow">AlbumSL</p>
        <h1>Base tecnica del album virtual</h1>
        <p>
          Frontend React inicial. Las features reales del album, auth, catalogo y sobres se
          implementaran como slices separados.
        </p>
      </section>
    </main>
  );
}
