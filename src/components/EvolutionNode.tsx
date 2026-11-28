import "./EvolutionNode.css";
import { SpriteDisplay } from "./SpriteDisplay";
import { TransitionLink } from "./TransitionLink";
import { Icon } from "./Icon";
import type { EvolutionNode as EvolutionNodeData } from "../lib/type";
import type { PokemonSprites, SpriteMode } from "../lib/sprites";

interface EvolutionNodeProps {
  data: EvolutionNodeData;
  sprites: Record<string, PokemonSprites | null>;
  //default "artwork" keeps this component looking the way it always did
  //EvolutionSection passes the user's real preference down
  mode?: SpriteMode;
  //the Pokémon whose page this is: its stage is marked, not linked
  current?: string;
  //true (default): sprites load when they near the screen (desktop, where
  //the chain is below the fold). false: they load right away, for the
  //phone tabs, where a lazy image in a hidden panel only starts loading
  //once the tab opens, and the panel showed empty for half a second
  lazy?: boolean;
}

//a stage sprite is 96 px of pixel art: 2x, a whole-number zoom, so every
//pixel stays square (the spec's 176 px would be 1.83x)
const NODE_SPRITE_BOX = 192;
const NODE_MAX_SCALE = 2;

//one stage: sprite on a small platform, name underneath. every stage but
//the current one is a link to that Pokémon's page (spec 7.2)
function EvolutionStage({
  name,
  sprites,
  mode,
  isCurrent,
  lazy,
}: {
  name: string;
  sprites: PokemonSprites | null;
  mode: SpriteMode;
  isCurrent: boolean;
  lazy: boolean;
}) {
  const content = (
    <>
      <span className="evolution-stage__sprite">
        {/* decorative: the name is right underneath, as text. never animated
            (only the stage sprite moves), and lazy unless told otherwise */}
        <SpriteDisplay
          sprites={sprites ?? {}}
          name={name}
          shiny={false}
          mode={mode}
          size={NODE_SPRITE_BOX}
          maxScale={NODE_MAX_SCALE}
          lazy={lazy}
          plain
          decorative
        />
      </span>
      <span className="evolution-stage__platform" aria-hidden="true" />
      <span className="evolution-stage__name">{name}</span>
    </>
  );

  //you are already here: no link to the page you are on. aria-current
  //says "this one is the current page" to a screen reader; the theme-color
  //platform and the bold name say it to the eye
  if (isCurrent) {
    return (
      <span className="evolution-stage" aria-current="page">
        {content}
      </span>
    );
  }

  return (
    <TransitionLink
      to={`/pokemon/${encodeURIComponent(name)}`}
      className="evolution-stage"
    >
      {content}
    </TransitionLink>
  );
}

export function EvolutionNode({
  data,
  sprites,
  mode = "artwork",
  current,
  lazy = true,
}: EvolutionNodeProps) {
  const stage = (
    <EvolutionStage
      name={data.name}
      sprites={sprites[data.name] ?? null}
      mode={mode}
      isCurrent={data.name === current}
      lazy={lazy}
    />
  );

  //base case:
  //no further evolutions from here
  //draw the stage and stop
  if (data.children.length === 0) {
    return stage;
  }

  //recursive case:
  //draw this stage, then every child subtree draws itself the same way,
  //each one after its own step: the condition ("Level 50") above an arrow.
  //the condition belongs to the CHILD (it says how the child is reached),
  //which is why it is read from child.condition
  return (
    <div className="evolution-branch-row">
      {stage}
      <div className="evolution-branch-group">
        {data.children.map((child) => (
          <div key={child.name} className="evolution-step">
            <p className="evolution-step__how">
              {child.condition && <span>{child.condition}</span>}
              <Icon name="arrow" />
            </p>
            {/* this line is where the recursion happens */}
            <EvolutionNode
              data={child}
              sprites={sprites}
              mode={mode}
              current={current}
              lazy={lazy}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
