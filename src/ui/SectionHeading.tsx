import { type ReactNode } from "react";
import "./SectionHeading.css";

interface SectionHeadingProps {
  //the page outline decides the level, the look never changes with it
  level?: 2 | 3;
  //so a <section aria-labelledby> can take its name from the heading
  id?: string;
  children: ReactNode;
}

//spec 5.6: a 2 px Ink rule, then the heading. no eyebrow label, no number
export function SectionHeading({
  level = 2,
  id,
  children,
}: SectionHeadingProps) {
  //a capitalised variable holding a tag name is how JSX renders "one of
  //several tags": <Tag> becomes <h2> or <h3>. a lowercase name would be
  //read as a literal (unknown) HTML element called "tag"
  const Tag = level === 2 ? "h2" : "h3";

  return (
    <Tag id={id} className="section-heading">
      {children}
    </Tag>
  );
}
