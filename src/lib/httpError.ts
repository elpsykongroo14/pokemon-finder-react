//a failed HTTP response means the server DID answerm but with a status we
//cannot use (404, 500, ...) that is different kind of failure from
//fetch() itself throwing, which means no answer ever arrived.
//a class (not a plain Error) lets callers ask  "was this an HTTP failure, and which status?" with instanceof, instead of parsing the message text
//
//this lives in its own file. not in api.ts, on purpose: tests mock the
//whole api module with vi.mock, and a mocked module swallow this
//class and break every instanceof check against it
export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, url: string) {
    //the message stays exactly, what it was before this class existed, so
    //every log line and test that read "HTTP 404 for:..." keeps working
    super(`HTTP ${status} for: ${url}`);
    this.name = "HttpError";
    this.status = status;
    this.url = url;
  }
}
