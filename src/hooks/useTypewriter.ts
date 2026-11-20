//this file takes the text and an enabled flag
//and returns the portion that should currently be visible

import { useEffect, useState } from "react";

export const TYPEWRITER_TICK_MS = 30;

export function useTypewriter(text: string, enabled: boolean): string {
  const [progress, setProgress] = useState({ text, count: 0 });
  const count = progress.text === text ? progress.count : 0; //this line says: "if this count is for a different message, treat is as 0"

  useEffect(() => {
    if (!enabled) return;

    let shown = 0;
    const id = setInterval(() => {
      shown += 1;
      setProgress({ text, count: shown });
      if (shown >= text.length) clearInterval(id);
    }, TYPEWRITER_TICK_MS);

    return () => clearInterval(id); //the cleanup line runs when text or enabled changes,
    //or when the component unmounts, without it an old message's timer would keep running and fight the new one
  }, [text, enabled]);

  return enabled ? text.slice(0, count) : text; //when animation is off, the hook returns the full text on the very first render
  //there is no empty frame and no timer
  //which is what "instant" should mean
}
