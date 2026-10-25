//this is the brain of compare mode
//it takes two numbers returns a string and has zero memory of anything
//thats what makes it safe to call directly inside the JSX on every render

export type StatWinner = "left" | "right" | "tie";

export function compareStat(left: number, right: number): StatWinner {
  if (left === right) return "tie";
  return left > right ? "left" : "right";
}

//what one side experienced, from that side's own point of view
//compareStat answers "who won?", this answers "and what does that mean for me"
//it returns domain words (win/lose/tie), never display words, so what the user
//reads (copy.ts) and what the css does (class names) can each change on their own
export type StatOutcome = "win" | "lose" | "tie";

export function outcomeForSide(
  winner: StatWinner,
  side: "left" | "right",
): StatOutcome {
  if (winner === "tie") return "tie";
  return winner === side ? "win" : "lose";
}
