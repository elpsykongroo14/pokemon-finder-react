import type { EvolutionNode as EvolutionNodeData } from "../lib/type";

interface EvolutionNodeProps {
  data: EvolutionNodeData;
  sprites: Record<string, string | null>;
}

export function EvolutionNode({ data, sprites }: EvolutionNodeProps) {
  const spriteUrl = sprites[data.name] ?? null;

  const stage = (
    <div className="evolution-stage">
      {spriteUrl ? (
        <img src={spriteUrl} alt={data.name} />
      ) : (
        <div className="sprite-placeholder">No image</div>
      )}
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
  return (
    <div className="evolution-branch-row">
      {stage}
      <div className="evolution-arrow" />
      <div className="evolution-branch-group">
        {data.children.map((child) => (
          <EvolutionNode key={child.name} data={child} sprites={sprites} />
        ))}
      </div>
    </div>
  );
}
