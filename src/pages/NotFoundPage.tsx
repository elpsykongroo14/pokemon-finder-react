import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section>
      <h2>Page not found</h2>
      <p className="status-message">
        <Link to="/">Back to search</Link>
      </p>
    </section>
  );
}
