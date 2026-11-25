import "./LibraryNotice.css";
import { MessageBox } from "../ui/MessageBox";
import { Button } from "../ui/Button";
import { RETRY_LABEL } from "../lib/copy";

interface LibraryNoticeProps {
  ///only the two states that show a sentence; each view draws "loading" itself
  status: "error" | "empty";
  error: string | null;
  emptyMessage: string;
  //asks for the cards again; left out, no Retry is offered
  onRetry?: () => void;
}

//the sentence every Library view shows when there are no cards to draw
//extracted when the binder became the third copy (the "rule of three").
//B&W-8 (spec 7.6): it sits in the battle dialog. a failure is an alert
//with a dark Retry, like FailureMessage; "no cards" is an ordinary
//outcome, a polite status with nothing to retry
export function LibraryNotice({
  status,
  error,
  emptyMessage,
  onRetry,
}: LibraryNoticeProps) {
  return (
    <div className="library-notice">
      {status === "error" ? (
        <MessageBox variant="error" text={error ?? ""}>
          {onRetry && (
            <Button variant="dark" onClick={onRetry}>
              {RETRY_LABEL}
            </Button>
          )}
        </MessageBox>
      ) : (
        <MessageBox text={emptyMessage} />
      )}
    </div>
  );
}
