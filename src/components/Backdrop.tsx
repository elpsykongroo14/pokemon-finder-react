import "./Backdrop.css";

//purely decorative: a tinted gradient that sits behind the whole app.
//aria hidden keeps it out of the accessibility tree, and it has
//no props because it reads its colot from the theme variables in CSS,
//so it never needs to know which pokemon is on screen
export function Backdrop() {
  return <div className="backdrop" aria-hidden="true" />;
}
