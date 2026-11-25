//PokeAPI names things with lowercase slugs ("dusk-stone", "flame-body").
//people read "Dusk Stone" and "Flame Body". CSS text-transform cannot do
//this: it would capitalise "Flame-body" and keep the hyphen
export function formatSlug(slug: string): string {
  return slug
    .split("-")
    .filter((word) => word !== "")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
