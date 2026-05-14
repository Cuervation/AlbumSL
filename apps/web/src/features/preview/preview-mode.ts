export function isPreviewMode(): boolean {
  return (
    typeof window !== "undefined" &&
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get("qaPreview") === "1"
  );
}
