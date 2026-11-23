import "./EncounterWipe.css";

//the wipe (spec 6.1): a black slab, then a thin white one, crossing the
//whole field once when a new Pokémon appears. it was part of
//PokemonEncounter; Home and Compare play it too now, so it is its own piece.
//
//it is drawn over whatever positioned box it sits in (the field, or the
//encounter layer, which covers the field), and it restarts the same way
//everything in the encounter does: the parent renders it with a key, and a
//new key mounts fresh slabs whose CSS animation starts from the beginning.
//decorative, and with motion off it is not drawn at all (CSS)
export function EncounterWipe() {
  return (
    <>
      <span className="encounter__wipe" aria-hidden="true" />
      <span className="encounter__wipe" data-white aria-hidden="true" />
    </>
  );
}
