import "./Stage.css";
import "./PokemonActions.css";
import "./PokemonSkeleton.css";
import { Panel } from "../ui/Panel";
import { Skeleton } from "../ui/Skeleton";
import { StageConsole } from "../ui/StageConsole";
import { LOADING_LABEL } from "../lib/copy";

//the loading state: a grey outline of the real page, built from the SAME
//layout pieces (StageConsole, Panel, the Stage's own classes) and the same
//key sizes (240px sprite box). When the real card replaces it, nothing
//moves, which is what keeps layout shift low.
//
//one status announcement for the whole thing: the wrapper. Every
//Skeleton inside is decorative, so a screen reader hears "Loading Pokémon"
//once instead of a dozen times.
export function PokemonSkeleton() {
  return (
    <div role="status" aria-label={LOADING_LABEL}>
      <StageConsole
        stage={
          <Panel variant="tinted">
            <div className="stage">
              <header className="stage__header">
                <Skeleton width={48} height={14} decorative />
                <Skeleton width={160} height={28} decorative />
                <Skeleton width={120} height={24} decorative />
              </header>
              <div className="stage__sprite">
                <Skeleton width={240} height={240} shape="circle" decorative />
              </div>
              <Skeleton width={120} height={24} decorative />
            </div>
          </Panel>
        }
      >
        <div className="pokemon-actions">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={96} height={40} decorative />
          ))}
        </div>
        <div className="pokemon-skeleton__tabs">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width={80} height={32} decorative />
          ))}
        </div>
        <div className="pokemon-skeleton__lines">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={16} decorative />
          ))}
        </div>
      </StageConsole>
    </div>
  );
}
