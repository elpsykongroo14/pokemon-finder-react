//the vitest adapter for the shared fake back end (src/testing/fakeBackend.ts):
//replaces the global fetch, so page level tests in jsdom rendedr the real app
//against fake data. an accessibility check is only worth something on the
//real markup, so we fake the network, never the components
import { vi } from "vitest";
import { fakeBackend } from "../testing/fakeBackend";

//installs the fake; vi.unstubAllGlobals() in afterEach removes it
export function installFakeApi(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      const answer = fakeBackend(url);
      //an unknown url is a bug in the test so we say so loudly
      if (!answer) {
        return new Response(`fakeApi: no route for ${url}`, { status: 599 });
      }
      return new Response(answer.body, {
        status: answer.status,
        headers: { "Content-type": answer.contentType },
      });
    }),
  );
}
