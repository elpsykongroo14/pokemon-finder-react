//WCAG 2.x contrast math, so a palette can be CHECKED instead of eyeballed.
//ratio runs from 1 (identical colors) to 21 (black on white).
//WCAG asks for at least 4.5 for normal text, 3 for large text.

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

//how bright a color looks to the eye, from 0 (black) to 1 (white).
//green counts most because our eyes are most sensitive to it
export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match?.[1])
    throw new Error(`Expected a 6-digit hex color, got "${hex}"`);

  const value = parseInt(match[1], 16);
  const r = channelToLinear((value >> 16) & 255);
  const g = channelToLinear((value >> 8) & 255);
  const b = channelToLinear(value & 255);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

//order does not matter: the brighter color always goes on top of the fraction
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);

  return (lighter + 0.05) / (darker + 0.05);
}
