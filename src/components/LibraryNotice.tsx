import "./LibraryNotice.css";

interface LibraryNoticeProps {
  ///only the two states that show a sentence; each view draws "loading" itself
  status: "error" | "empty";
  error: string | null;
  emptyMessage: string;
}

//the sentence every Library view shows when there are no cards to draw
//extracted when the binder became the third copy (the "rule of three")
export function LibraryNotice({
  status,
  error,
  emptyMessage,
}: LibraryNoticeProps) {
  return (
    <p className="library-empty">{status === "error" ? error : emptyMessage}</p>
  );
}
