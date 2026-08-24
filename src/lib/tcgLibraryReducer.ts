import type { TCGCard } from "./type";

export type libraryStatus = "loading" | "success" | "empty" | "error";

export interface TCGLibraryState {
  title: string;
  cards: TCGCard[];
  status: libraryStatus;
  error: string | null;
}

export type TCGLibraryAction =
  | { type: "FETCH_START"; title: string }
  | { type: "FETCH_SUCCESS"; payload: TCGCard[] }
  | { type: "FETCH_ERROR"; payload: string };

export const initialTCGLibraryState: TCGLibraryState = {
  title: "Feature Cards",
  cards: [],
  status: "loading",
  error: null,
};

//A reducer must be pure: same input, same output, forever.
//zero side effects: no fetches, no timers, no DOM. All the actual async work happens in the hook below
//this function only describes how state transitions in response to an action that already happens
export function tcgLibraryReducer(
  state: TCGLibraryState,
  action: TCGLibraryAction,
): TCGLibraryState {
  switch (action.type) {
    case "FETCH_START":
      //deliberately drop the old cards here rather than spreading ...state
      //a stale grid of cards from the PREVIOUS search sitting behind a loading spinner is a worse UX than an empty grid
      //and its exactly the kind of "looks fine, is actually wrong" bug thats easy to miss at first
      return { title: action.title, cards: [], status: "loading", error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        cards: action.payload,
        status: action.payload.length > 0 ? "success" : "empty",
        error: null,
      };
    case "FETCH_ERROR":
      return { ...state, cards: [], status: "error", error: action.payload };
    default:
      return state;
  }
}
