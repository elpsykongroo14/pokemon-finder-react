import { useEffect } from "react";
import { TYPE_CHART } from "../lib/typeEffectiveness";

//the 18 type names that have a theme block in type-themes.css.
//derived from TYPE_CHART so the app keeps one list of types, not two.
const KNOW_TYPES = new Set(Object.keys(TYPE_CHART));

function knowTypeOrUndefined(name: string | undefined): string | undefined {
  return name !== undefined && KNOW_TYPES.has(name) ? name : undefined;
}

export function useTypeTheme(typeNames: readonly string[] | undefined) {
  //Strings, not the array: strings compare by value, so the effect only
  //reruns when the theme actually changes.
  const primary = knowTypeOrUndefined(typeNames?.[0]);
  const secondary = primary ? knowTypeOrUndefined(typeNames?.[1]) : undefined;

  useEffect(() => {
    const root = document.documentElement;

    if (primary) {
      root.dataset.type = primary;
    }
    if (secondary) {
      root.dataset.type2 = secondary;
    }

    //runs before the next setup AND on unmout
    //'delete' removes the attribute; '=undefined' would write "undefined"
    return () => {
      delete root.dataset.type;
      delete root.dataset.type2;
    };
  });
}
