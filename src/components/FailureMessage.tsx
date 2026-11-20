import { MessageBox } from "../ui/MessageBox";
import { Button } from "../ui/Button";
import { failureMessage, RETRY_LABEL } from "../lib/copy";
import type { FetchFailureKind } from "../lib/fetchErrors";

interface FailureMessageProps {
  kind: FetchFailureKind;
  //what the user looked up, used in "not found" sentence
  query: string;
  onRetry: () => void;
}

//the ONE place that decides what a failed lookup looks like:
//  not-found    an ordinary outcome: polite "status", no button (asking again cannot help)
//  unreachable  a real problem: assertive "alert", plus a Retry button
//every screen that fetches a Pokémon uses this, so they cannot drift apart
export function FailureMessage({ kind, query, onRetry }: FailureMessageProps) {
  const text = failureMessage(kind, query);

  if (kind === "unreachable") {
    return (
      <MessageBox variant="error" text={text}>
        <Button variant="secondary" onClick={onRetry}>
          {RETRY_LABEL}
        </Button>
      </MessageBox>
    );
  }

  return <MessageBox text={text} />;
}
