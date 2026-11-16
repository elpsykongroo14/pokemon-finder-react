//the browser-tab title format, kept in lib/ (not next to the component)
//because a .tsx file that exports a component should export ONLY
//components: that is what lets Vite's Fast Refresh swap it in place
//while we edit. plain values and functions live in plain .ts files
export const APP_NAME = "Pokémon Finder";

//one format for every page, decided in one place:
//the specific part first (what tab am I on?), the app name last
export function pageTitle(page?: string): string {
  return page ? `${page} · ${APP_NAME}` : APP_NAME;
}

//the reverse: turns a document title back into the page's name, for the
//skip link that announces page changes. Home's title is the bare app name,
//which as a page name would say nothing, so Home is called "Home"
export function pageNameFromTitle(title: string): string {
  const suffix = ` · ${APP_NAME}`;
  if (title === APP_NAME || title === "") return "Home";
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title;
}
