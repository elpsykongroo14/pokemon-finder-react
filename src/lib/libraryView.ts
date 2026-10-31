export const LIBRARY_VIEWS = ["grid", "table", "binder"] as const;
export type LibraryView = (typeof LIBRARY_VIEWS)[number];

export const DEFAULT_LIBRARY_VIEW: LibraryView = "grid";

export function isLibraryView(value: unknown): value is LibraryView {
  return LIBRARY_VIEWS.some((view) => view === value);
}

export function parseLibraryView(raw: string | null): LibraryView {
  return isLibraryView(raw) ? raw : DEFAULT_LIBRARY_VIEW;
}

export function withLibrayView(
  params: URLSearchParams,
  view: LibraryView,
): URLSearchParams {
  const next = new URLSearchParams(params);
  if (view === DEFAULT_LIBRARY_VIEW) {
    next.delete("view");
  } else {
    next.set("view", view);
  }
  return next;
}
