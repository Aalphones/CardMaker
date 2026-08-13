import Konva from 'konva';
import { ContainerConfig } from 'konva/lib/Container';
import { EllipseConfig } from 'konva/lib/shapes/Ellipse';
import { ImageConfig } from 'konva/lib/shapes/Image';
import { LineConfig } from 'konva/lib/shapes/Line';
import { RectConfig } from 'konva/lib/shapes/Rect';
import { TextConfig } from 'konva/lib/shapes/Text';

import { DrawItem } from './card-canvas/draw-items';

/**
 * Gegenstück zu `card-canvas.html`. Kommt dort ein Elementtyp dazu, gehört er auch hierher —
 * sonst fehlt er still im Export.
 *
 * Die Zeichenliste ist dieselbe (`buildDrawItems`), nur der Weg in die Konva-Knoten
 * unterscheidet sich: dort über die Angular-Vorlage, hier von Hand. Ereignisse gibt es hier
 * keine — das Bild ist tot.
 */
export function drawItemsToStage(stage: Konva.Stage, items: DrawItem[], scale: number): void {
  const layer = new Konva.Layer({ scaleX: scale, scaleY: scale, listening: false });

  for (const item of items) {
    layer.add(nodeFor(item));
  }

  stage.add(layer);
}

/**
 * Der Wert von `item.element` bestimmt, welche Variante in `item.config` steckt (Kontrakt von
 * `DrawItem`) — die Umwandlung sagt dem Typsystem, was der Zweig ohnehin weiß.
 */
function nodeFor(item: DrawItem): Konva.Group | Konva.Shape {
  switch (item.element) {
    case 'image':
      return new Konva.Image(item.config as ImageConfig);
    case 'rect':
      return new Konva.Rect(item.config as RectConfig);
    case 'ellipse':
      return new Konva.Ellipse(item.config as EllipseConfig);
    case 'line':
      return new Konva.Line(item.config as LineConfig);
    case 'text':
      return new Konva.Text(item.config as TextConfig);
    case 'group':
      return groupNode(item);
  }
}

/** Nur Kartenbilder: die Gruppe trägt den Zuschnitt, die Kinder sind ausschließlich Bilder. */
function groupNode(item: DrawItem): Konva.Group {
  const group = new Konva.Group(item.config as ContainerConfig);

  for (const child of item.children ?? []) {
    group.add(new Konva.Image(child.config as ImageConfig));
  }

  return group;
}
