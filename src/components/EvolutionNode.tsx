import type { EvolutionNode as EvolutionNodeData } from "../lib/type";

interface EvolutionNodeProps {
  data: EvolutionNodeData;
}

export function EvolutionNode({ data }: EvolutionNodeProps) {
  //base case:
  //no further evolutions from here
  //draw the stage and stop
  if (data.children.length === 0) {
    return (
      <div className="evolution-stage">
        <span>{data.name}</span>
      </div>
    );
  }

  //recursive case:
  //draw this stage, then let every child subtree draw itself the same way
  //this line is where the recursion happens
  return (
    <div className="evolution-branch-row">
      <div className="evolution-stage">
        <span>{data.name}</span>
      </div>
      <div className="evolution-branch" />
      <div className="evolution-branch-group">
        {data.children.map((child) => (
          <EvolutionNode key={child.name} data={child} />
        ))}
      </div>
    </div>
  );
}
