//the slot (0, 1, 2, ...) an item takes in a "one after another" entrance
//a slot is multiplied by a small delay in CSS, so slot 3 starts 3 beats after slot 0
//
//two rules keep the effect from becoming an annoyance:
//1) items that arrive AFTER the list first appeared (position >= settledCount)
//   get slot 0: a Pokémon we just favorited should pop in now, not wait
//   behind a queue that is not there
//2) the slot is capped at `max`, so a list of 60 never makes the last item
//   wait 60 beats: everything past the cap enters together with the cap-th

export function staggerSlot(
  position: number,
  settledCount: number,
  max = 8,
): number {
  if (position >= settledCount) return 0;
  return Math.min(position, max);
}
