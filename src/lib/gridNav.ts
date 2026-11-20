//pure: where does the highlight go when an arrow key is pressed in a grid?
//items are numbered 0,1,2,... left to right, top to bottom, so in a grid
//with 2 columns:   0 1
//                  2 3
//returns the new index, or null when the key is not one we handle (so the
//caller knows to leave the browser's default behavior alone)
//
//moves wrap around the edges, like a game menu: Right on the last item of a
//row goes to the first item of that same row
export function moveInGrid(
  index: number,
  key: string,
  columns: number,
  count: number,
): number | null {
  if (count <= 0) return null;

  const row = Math.floor(index / columns);
  const col = index % columns;
  const rowStart = row * columns;
  //the last row may be short (5 items in 2 columns leaves one alone)
  //so a row ends at columns items or at the end of the list, whichever if first
  const rowEnd = Math.min(rowStart + columns, count) - 1;

  switch (key) {
    case "ArrowRight":
      return index === rowEnd ? rowStart : index + 1;
    case "ArrowLeft":
      return index === rowStart ? rowEnd : index - 1;
    case "ArrowDown": {
      const below = index + columns;
      if (below < count) return below;
      //nothing below: wrap to the top of the same column
      return col;
    }
    case "ArrowUp": {
      const above = index - columns;
      if (above >= 0) return above;
      //nothing above: wrap to the lowest item in the same column
      let lowest = col;
      while (lowest + columns < count) lowest += columns;
      return lowest;
    }
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}
