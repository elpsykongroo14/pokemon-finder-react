//pixel art as text: each string is one row, each character one pixel,
//"." means transparent. this file turns rows into the fewest rectangles

export interface PixelRun {
  x: number;
  y: number;
  width: number;
  color: string; //the palette key, e.g "g" for grass
}

export const TRANSPARENT = ".";

//the run length encoding, row by row: walk each row left to right and merge
//neighbouring pixels of the of the same key into one run. a 48x26 picture is 1248
//pixels, but only ~150 runs, so the SVG gets ~150 <rect>s instead of 1248
export function toRuns(rows: readonly string[]): PixelRun[] {
  const runs: PixelRun[] = [];

  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const color = row[x]!; //x < row.length, so the character exists
      let end = x + 1;
      while (end < row.length && row[end] === color) end++;

      if (color !== TRANSPARENT) {
        runs.push({ x, y, width: end - x, color });
      }
      x = end;
    }
  });

  return runs;
}
