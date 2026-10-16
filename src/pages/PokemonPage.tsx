import { useParams } from "react-router-dom";
import { usePokemon } from "../hooks/usePokemon";
import { PokemonCard } from "../components/PokemonCard";
import { PokemonSkeleton } from "../components/PokemonSkeleton";
import { MessageBox } from "../ui/MessageBox";
import { useTypeTheme } from "../hooks/useTypeTheme";
import { getPokemonPageState } from "../lib/pokemonPageState";
import { failureMessage } from "../lib/copy";

export function PokemonPage() {
  const { name } = useParams<{ name: string }>(); //this line reads the dynamic segment straight off the current URL.
  //it just reflects whatever the router already matched to get this component rendered in the first place
  //useParams here just reads result
  const { data, loading, error } = usePokemon(name ?? "");

  useTypeTheme(error ? undefined : data?.types.map((t) => t.type.name));
  //usePokemon does not clear data when name changes
  //so while the next Pokemon loads, data still holds the previous one
  //thats gives us a good property for free
  //moving pikachu->charizard goes yellow -> orange directly instead of
  // yellow -> default -> orange, which would flicker, but if the new fetch fails, data is still the old pokemon and the page would show an error while wearing the old pokemon's colors
  //so we pass undefined on error.

  //instead of four seperate '{condition && ...}' blocks that could overlap.
  //we first work out WHICH single situation we are in, then render only that
  const state = getPokemonPageState({ name, loading, error, data });

  switch (state.status) {
    case "no-name":
      return <MessageBox text="No Pokémon specified" />;
    case "loading":
      return <PokemonSkeleton />;
    case "failed":
      //a search that matched nothing is an ordinary outcome (polite "status"),
      //a dead connection is a real problem (assertive "alert")
      return (
        <MessageBox
          variant={state.kind === "unreachable" ? "error" : "info"}
          text={failureMessage(state.kind, state.name)}
        />
      );
    case "ready":
      return <PokemonCard pokemon={state.pokemon} />;
  }
}
