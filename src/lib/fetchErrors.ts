import { HttpError } from "./httpError";

//the only two things the screen needs to tell apart:
//"not-found"  the request worked and the answer is "that does not exist" retrying cannot help, the user should change what they typed
//"unreachable" aything else: no network, server error, rate limit...the user did nothing wrong and trying again may work
export type FetchFailureKind = "not-found" | "unreachable";

//pure function: an unknown thrown value goes in, one of two labels comes out
//the parameter is 'unkown' because javascript lets you throw anything
//(a string, a number), and a catch block cannot promise it caught an Error
//
//callers must handle AbortError BEFORE calling this: an aborted request is
//us cancelling on purpose, not failure, and deserves no message at all
export function classifyFetchError(error: unknown): FetchFailureKind {
  if (error instanceof HttpError && error.status === 404) return "not-found";
  return "unreachable";
}
