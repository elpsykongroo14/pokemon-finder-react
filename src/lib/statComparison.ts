//this is the brain of compare mode
//it takes two numbers returns a string and has zero memory of anything
//thats what makes it safe to call directly inside the JSX on every render

export type StatWinner = "left" | "right" | "tie";

export function compareStat(left: number, right: number): StatWinner {
  if (left === right) return "tie";
  return left > right ? "left" : "right";
}
