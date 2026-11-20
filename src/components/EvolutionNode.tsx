import "./EvolutionNode.css";
import type { CSSProperties } from "react";
import { SpriteDisplay } from "./SpriteDisplay";
import type { EvolutionNode as EvolutionNodeData } from "../lib/type";
import type { PokemonSprites, SpriteMode } from "../lib/sprites";

interface EvolutionNodeProps {
  data: EvolutionNodeData;
  sprites: Record<string, PokemonSprites | null>;
  //default "artwork" keeps this component looking the way it always did
  //EvolutionSection passes the user's real preference down
  mode?: SpriteMode;
  //how many arrows are above this node. Each level of the tree draws its
  //arrow a beat later than the level before so the chain reads left to right
  depth?: number;
}

export function EvolutionNode({
  data,
  sprites,
  mode = "artwork",
  depth = 0,
}: EvolutionNodeProps) {
  const nodeSprites = sprites[data.name] ?? null;

  const stage = (
    <div className="evolution-stage">
      {/* evolution icons never animate (animate stays false): only the stage sprite is allowed to move, and they are lazy because this tab starts hiddem */}
      <SpriteDisplay
        sprites={nodeSprites ?? {}}
        name={data.name}
        shiny={false}
        mode={mode}
        size={96}
        lazy
        plain
      />
      <span>{data.name}</span>
    </div>
  );

  //base case:
  //no further evolutions from here
  //draw the stage and stop
  if (data.children.length === 0) {
    return stage;
  }

  //recursive case:
  //draw this stage, then let every child subtree draw itself the same way
  //this line is where the recursion happens
  //depth + 1 is how each each recursive call learn it is one level deeper
  return (
    <div className="evolution-branch-row">
      {stage}
      <div
        className="evolution-arrow"
        style={{ "--evo-depth": depth } as CSSProperties}
      />
      <div className="evolution-branch-group">
        {data.children.map((child) => (
          <EvolutionNode
            key={child.name}
            data={child}
            sprites={sprites}
            mode={mode}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  );
}
