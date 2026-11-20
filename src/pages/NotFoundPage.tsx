import "./NotFoundPage.css";
import { PageHeader } from "../ui/PageHeader";
import { MessageBox } from "../ui/MessageBox";
import { TransitionLink } from "../components/TransitionLink";
import { LostRouteScene } from "../components/LostRouteScene";
import {
  NOT_FOUND_ENCOUNTER,
  NOT_FOUND_HEADING,
  NOT_FOUND_LINK,
  NOT_FOUND_SUBTITLE,
} from "../lib/copy";

//a 404 told as a wild encounter: the scene (top screen), the message box
//line, and one clear way out ("Run", as in a battle menu). it opens with the
//same PageHeader as every page, so it still feels like part of the app
export function NotFoundPage() {
  return (
    <section className="not-found">
      <PageHeader title={NOT_FOUND_HEADING} subtitle={NOT_FOUND_SUBTITLE} />
      <LostRouteScene />
      <MessageBox text={NOT_FOUND_ENCOUNTER} />
      <TransitionLink to="/" variant="primary">
        {NOT_FOUND_LINK}
      </TransitionLink>
    </section>
  );
}
