import { useMemo } from "react";
import { toRuns } from "../lib/pixelArt";

export interface PixelLayer {
  //becomes the class "pixel-art__layer--<name>", so CSS can animate one
  //layer (the grass) without touching the others (the sign)
  name: string;
  rows: readonly string[];
}

interface PixelArtProps {
  width: number;
  height: number;
  palette: Readonly<Record<string, string>>;
  layers: readonly PixelLayer[];
  label: string; //what the picture shows, for screen readers
  className?: string;
}

//draws text-based pixel art as one crisp, scalable SVG. layers are drawn in
//order, so later layers sit on top (grass in front of the sign's post)
export function PixelArt({
  width,
  height,
  palette,
  layers,
  label,
  className,
}: PixelArtProps) {
  //the art never changes while the page is open, so the runs are computed
  //once per art, not on every render
  const drawn = useMemo(
    () =>
      layers.map((layer) => ({ name: layer.name, runs: toRuns(layer.rows) })),
    [layers],
  );

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      //no blurring between pixels when the SVG is scaled up
      shapeRendering="crispEdges"
    >
      {drawn.map((layer) => (
        <g
          key={layer.name}
          className={`pixel-art__layer pixel-art__layer--${layer.name}`}
        >
          {layer.runs.map((run) => (
            <rect
              key={`${run.x}-${run.y}`}
              x={run.x}
              y={run.y}
              width={run.width}
              height={1}
              fill={palette[run.color]}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
