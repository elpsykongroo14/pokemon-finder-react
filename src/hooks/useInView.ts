import { useEffect, useState, type RefObject } from "react";

//"has this element been on screen yet?": false until it scrolls into view,
//then true for good. the browser's IntersectionObserver answers the
//question; React only keeps the answer (the same "the browser owns it"
//idea as useMediaQuery, but a one-way switch, so plain state is enough)
//
//where IntersectionObserver does not exist the answer is true at once:
//loading straight away is better than never loading
const CAN_OBSERVE = () => typeof IntersectionObserver === "function";

export function useInView<T extends Element>(
  ref: RefObject<T | null>,
): boolean {
  //the initial value is decided once, on the first render: a lazy
  //initializer, so the check does not run again on every render
  const [seen, setSeen] = useState(() => !CAN_OBSERVE());

  useEffect(() => {
    const element = ref.current;
    if (seen || !element || !CAN_OBSERVE()) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setSeen(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, seen]);

  return seen;
}
