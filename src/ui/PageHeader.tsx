import "./PageHeader.css";
import type { ReactNode } from "react";
import { PageTitle } from "./PageTitle";

interface PageHeaderProps {
  //the page's name, an h2: the h1 is the app name in the shell's header
  title: string;
  //one sentence saying what the page is FOR, not what is on it
  subtitle?: ReactNode;
  //optional controls that act on the whole page (e.g. Library's "Featured")
  actions?: ReactNode;
  //the browser-tab title when it should say more than the heading
  //(e.g which pokemon's cards); defaults to the heading itself
  documentTitle?: string;
}

//every page opens the same way: name, purpose, page-wide actions.
//a <header> inside <main> is NOT a "banner" landmark (only the header that
//belongs to the whole page is), so this adds no duplicate landmark
//
//every page that has a PageHeader also gets its browser-tab title from it
//so a new page cant forget one: heading and tab title stay in step
export function PageHeader({
  title,
  subtitle,
  actions,
  documentTitle,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <PageTitle page={documentTitle ?? title} />
      <div className="page-header__text">
        <h2 className="page-header__title">{title}</h2>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
