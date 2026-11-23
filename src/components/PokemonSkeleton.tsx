import "./Stage.css";
import "./PokemonSkeleton.css";
import { Skeleton } from "../ui/Skeleton";
import { LOADING_LABEL } from "../lib/copy";

//the silhouette's size: about a 3x Black & White sprite, so the real one
//lands roughly where the blob was
const SILHOUETTE = { width: 220, height: 240 } as const;

//the loading state inside the encounter field (spec 7.6): the field in
//the Graphite theme (no Pokémon yet, so no data-type), an empty platform,
//and a pulsing Mist blob where the sprite will stand. it uses the Stage's
//own classes, so it sits exactly where the real stage will.
//
//one status announcement for the whole thing: the wrapper. the Skeleton
//inside is decorative, so a screen reader hears the loading line once
export function PokemonSkeleton() {
  return (
    <div
      className="stage pokemon-skeleton"
      role="status"
      aria-label={LOADING_LABEL}
    >
      <span className="stage__platform" aria-hidden="true" />
      <div className="stage__sprite">
        <Skeleton
          width={SILHOUETTE.width}
          height={SILHOUETTE.height}
          shape="circle"
          decorative
        />
      </div>
    </div>
  );
}
