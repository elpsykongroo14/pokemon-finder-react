//the geometry of the holo card effect: where is the pointer on the card, and
//what tilt and shine position does that mean? pure, like pagination.ts

export interface HoloPose {
  //where the shine sits, as a percentage of the card (0 = left/top edge)
  mx: number;
  my: number;
  //the tilt in degrees
  rx: number;
  ry: number;
}

//the only fields of a DOMRect we need, so tests can pass a plain object
export interface PointerBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const MAX_TILT_DEG = 8;

//0..1, with "the middle" as the answer for anything that is not a number
function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}

//two decimals is plenty for a style value. "+ 0" turns -0 into 0, because
//Math.round(-0.001) is -0 and a style of "-0deg" is just noise
function round2(value: number): number {
  return Math.round(value * 100) / 100 + 0;
}

//the pointer pushes the card DOWN where it touches: pointer on the right
//edge presses the right edge away from us (positive ry); pointer near the
//top presses the top edge away (positive rx)
export function getHoloPose(
  box: PointerBox,
  clientX: number,
  clientY: number,
  maxTilt: number = MAX_TILT_DEG,
): HoloPose {
  const px = box.width > 0 ? clamp01((clientX - box.left) / box.width) : 0.5;
  const py = box.height > 0 ? clamp01((clientY - box.top) / box.height) : 0.5;

  return {
    mx: round2(px * 100),
    my: round2(py * 100),
    ry: round2((px - 0.5) * 2 * maxTilt),
    rx: round2(-(py - 0.5) * 2 * maxTilt),
  };
}
