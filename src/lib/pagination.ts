//pagination as pure functions: numbers and arrays in, numbers and arrays out.
//no react, no router, no DOM. the Binder view asks theses functions what to show

//the URL is input anyone can edit (?page=banana, ?page=-4, ?page=9999)
//so we never trust it, a page os a whole number >=1, anything else is page 1,
//the regex rejects "0", "-1", "2.5", "2", "02", and "1e3" before Number() runs
export function parsePage(raw: string | null): number {
  if (raw === null || !/^[1-9]\d*$/.test(raw)) return 1;
  const page = Number(raw);
  return Number.isSafeInteger(page) ? page : 1;
}

//how many pages `totalItems` fill. an empty list still has ONE (empty) page,
//so "Page 1 of 1" is always true and the page number never reaches 0
export function getPageCount(totalItems: number, pageSize: number): number {
  assertPageSize(pageSize);
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

//force a requested page into the range that exists: 1 ..pageCount
export function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(1, page), pageCount);
}

export interface PageSlice<T> {
  items: T[];
  //the page actually shown, after clamping (may differ from the one asked for)
  page: number;
  pageCount: number;
}

//the slice of `items` that belongs on `requestedPage`. never mutates `items`.
//?page=999 on a 3-page list quietly shows page 3 instead of an empty screen
export function paginate<T>(
  items: readonly T[],
  requestedPage: number,
  pageSize: number,
): PageSlice<T> {
  const pageCount = getPageCount(items.length, pageSize);
  const page = clampPage(requestedPage, pageCount);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageCount };
}

//new params with the page applied, everything else untouched, page 1 is the
//default, so it is removed instead of written (same idea as withLibraryView)
export function withPage(
  params: URLSearchParams,
  page: number,
): URLSearchParams {
  const next = new URLSearchParams(params);
  if (page <= 1) {
    next.delete("page");
  } else {
    next.set("page", String(page));
  }
  return next;
}

//"?view=binder&page=3" -> "?view=binder". used when the RESULTS change (a new
//search): the view should follow us, but page 3 of the old results means nothing
export function withoutPage(search: string): string {
  const text = withPage(new URLSearchParams(search), 1).toString();
  return text === "" ? "" : `?${text}`;
}

function assertPageSize(pageSize: number): void {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError(`pageSize must be whole number >= 1, got ${pageSize}`);
  }
}
