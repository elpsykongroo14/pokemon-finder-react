import { PageHeader } from "../ui/PageHeader";
import { TransitionLink } from "../components/TransitionLink";
import {
  NOT_FOUND_HEADING,
  NOT_FOUND_LINK,
  NOT_FOUND_SUBTITLE,
} from "../lib/copy";

export function NotFoundPage() {
  return (
    <section>
      <PageHeader title={NOT_FOUND_HEADING} subtitle={NOT_FOUND_SUBTITLE} />
      <TransitionLink to="/" variant="primary">
        {NOT_FOUND_LINK}
      </TransitionLink>
    </section>
  );
}
