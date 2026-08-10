/**
 * Ergebnis eines Konva-`dragend`/`transformend`: Skalierung schreibt Konva als `scaleX`/
 * `scaleY` an den Knoten statt Breite/Höhe zu ändern. Die Werte hier stehen bereits in
 * Canvas-Einheiten — Konva rechnet beim Transformieren selbst gegen die Elternknoten
 * zurück, siehe `docs/conventions/state-management.md` (Fallstrick „Konva-Transform-Events
 * und Reducer-Frequenz"), Bühnenmaßstab ist also schon herausgerechnet.
 */
export interface NodeTransformSnapshot {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface GeometryPatch {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

const ROUNDING_FACTOR = 100;

function round(value: number): number {
  return Math.round(value * ROUNDING_FACTOR) / ROUNDING_FACTOR;
}

/** Canvas-Einheiten sind zehntel Millimeter — mehr als zwei Nachkommastellen sind Rauschen. */
export function geometryFromNodeSnapshot(snapshot: NodeTransformSnapshot): GeometryPatch {
  return {
    x: round(snapshot.x),
    y: round(snapshot.y),
    width: round(snapshot.width * snapshot.scaleX),
    height: round(snapshot.height * snapshot.scaleY),
    rotation: round(snapshot.rotation),
  };
}

/**
 * Eine Linie hat keine Geometrie (kein `x`/`y` im Kontrakt), nur zwei Punkte. Konva bewegt
 * sie beim Ziehen trotzdem über den Knoten-Versatz — die Verschiebung wandert hier in die
 * Punkte, der Knoten wird danach imperativ auf 0/0 zurückgesetzt (Aufrufer-Pflicht).
 */
export function offsetLinePoints(
  points: readonly [number, number, number, number],
  deltaX: number,
  deltaY: number,
): [number, number, number, number] {
  return [round(points[0] + deltaX), round(points[1] + deltaY), round(points[2] + deltaX), round(points[3] + deltaY)];
}
