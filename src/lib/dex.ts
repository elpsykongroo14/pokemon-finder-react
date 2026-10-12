//pure formatting helper, no DOM, no React
//dex numbers show as #006, #025, #150. padStart only ever adds zeros
//it never cuts, so #1025 stays #1025
export function formatDexNumber(id: number): string {
  if (!Number.isInteger(id) || id < 1) return "#???";
  return `#${String(id).padStart(3, "0")}`;
}
