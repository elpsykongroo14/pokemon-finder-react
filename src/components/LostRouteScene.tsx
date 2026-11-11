import "./LostRouteScene.css";
import { PixelArt } from "../ui/PixelArt";
import {
  LOST_ROUTE_HEIGHT,
  LOST_ROUTE_LAYERS,
  LOST_ROUTE_PALETTE,
  LOST_ROUTE_WIDTH,
} from "./lostRouteArt";
import { NOT_FOUND_SCENE_LABEL } from "../lib/copy";

//the 404 picture, all the drawing lives in lostRouteArt.ts (data) and
//PixelArt (the generic renderer); this component only puts the two together
export function LostRouteScene() {
  return (
    <div className="lost-rout">
      <PixelArt
        className="lost-route__art"
        width={LOST_ROUTE_WIDTH}
        height={LOST_ROUTE_HEIGHT}
        palette={LOST_ROUTE_PALETTE}
        layers={LOST_ROUTE_LAYERS}
        label={NOT_FOUND_SCENE_LABEL}
      />
    </div>
  );
}
