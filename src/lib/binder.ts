//the binder's spreads (D54, D55), pure like pagination.ts: numbers in,
//numbers out. ?page= keeps meaning ONE page of nine cards, so a link from
//before spreads existed still opens the right cards

import { clampPage } from "./pagination";

//a 3x3 sleeve page, like a real binder
export const BINDER_PAGE_SIZE = 9;

//two pages side by side on a wide screen, one on a phone (D55)
export type PagesPerSpread = 1 | 2;

export interface BinderSpread {
  //the pages to draw, left to right. with two per spread the right one can
  //be pageCount + 1: the page past the last card, where the binder says
  //"That's all 25 cards." instead of showing empty pockets
  pages: number[];
  pageCount: number;
  //the page to ask for to turn back or on, or null at either end
  previous: number | null;
  next: number | null;
}

export function getBinderSpread(
  requestedPage: number,
  pageCount: number,
  pagesPerSpread: PagesPerSpread,
): BinderSpread {
  const page = clampPage(requestedPage, pageCount);
  //two per spread: odd pages open on the left, so an even page belongs
  //to the spread that starts one page earlier
  const first = pagesPerSpread === 2 && page % 2 === 0 ? page - 1 : page;
  const pages = pagesPerSpread === 2 ? [first, first + 1] : [first];
  const next = first + pagesPerSpread;

  return {
    pages,
    pageCount,
    previous: first > 1 ? Math.max(1, first - pagesPerSpread) : null,
    next: next <= pageCount ? next : null,
  };
}
