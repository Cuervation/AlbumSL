export type HomeIconName = "album" | "duplicates" | "exchange" | "home" | "pack" | "stickers";

export function HomeIcon({ name }: { readonly name: HomeIconName }): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "home" ? (
        <>
          <path d="M3.5 10.8 12 3.5l8.5 7.3" />
          <path d="M5.8 9.2v10.1h12.4V9.2M9.4 19.3v-5.8h5.2v5.8" />
        </>
      ) : null}
      {name === "album" ? (
        <>
          <path d="M4 4.5h6.5c1.1 0 1.5.7 1.5 1.5v14c0-.8-.4-1.5-1.5-1.5H4z" />
          <path d="M20 4.5h-6.5c-1.1 0-1.5.7-1.5 1.5v14c0-.8.4-1.5 1.5-1.5H20z" />
          <path d="M7 8h2M15 8h2" />
        </>
      ) : null}
      {name === "stickers" ? (
        <>
          <rect x="5" y="4" width="13" height="16" rx="2" />
          <path d="m9 12 2-2 4 4M14.5 8.5h.01" />
          <path d="M8 2.5h9.5a2 2 0 0 1 2 2V17" />
        </>
      ) : null}
      {name === "duplicates" ? (
        <>
          <rect x="4" y="6" width="12" height="14" rx="2" />
          <path d="M8 3h10a2 2 0 0 1 2 2v12M8 11h4M10 9v4" />
        </>
      ) : null}
      {name === "exchange" ? (
        <>
          <path d="M7 7h10l-2.5-2.5M17 17H7l2.5 2.5" />
          <path d="M19.5 8.5A7.5 7.5 0 0 1 20 12M4 12a7.5 7.5 0 0 1 .5-2.7M4.5 15.5A7.5 7.5 0 0 0 7 18M17 6a7.5 7.5 0 0 0-2.5-1.4" />
        </>
      ) : null}
      {name === "pack" ? (
        <>
          <path d="M6 3.5h12l-1 4 1 3-1 3 1 7H6l1-7-1-3 1-3z" />
          <circle cx="12" cy="12.5" r="2.6" />
          <path d="M9 6.5h6M9 18h6" />
        </>
      ) : null}
    </svg>
  );
}
