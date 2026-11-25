import { useState } from "react";
import {
  getComparePageState,
  type ComparePageState,
  type ShownPair,
} from "../lib/comparePageState";

type Inputs = Omit<Parameters<typeof getComparePageState>[0], "shown">;

//getComparePageState decides which situation the page is in; this hook
//adds the one thing a pure function cannot have: memory of what was on
//screen. while a side reloads, that remembered comparison stays up
//(pending), so a pick or a Swap never drops the page to a loading message.
//
//"adjust state during render" (the same pattern as usePartyArrival): we
//compare what we remember with what we see, and if they differ, we set
//state right here instead of in an effect. React throws this render away
//and runs the component again at once, so no frame is ever painted with
//the old memory. an effect would update it one painted frame too late
export function useComparePageState(inputs: Inputs): ComparePageState {
  const [shown, setShown] = useState<ShownPair | null>(null);
  const state = getComparePageState({ ...inputs, shown });

  if (state.status === "ready") {
    //a fresh (not pending) comparison is now what's on screen: remember it.
    //the identity check stops the loop: on the re-render they are equal
    if (
      !state.pending &&
      (state.primary !== shown?.primary || state.secondary !== shown?.secondary)
    ) {
      setShown({ primary: state.primary, secondary: state.secondary });
    }
  } else if (shown !== null) {
    //something else is on screen (a message, "pick a second"): forget the
    //old comparison, or a later load could bring it back from the dead
    setShown(null);
  }

  return state;
}
