# 001 — Canvas-Rendering mit Konva.js

**Status:** Akzeptiert (2026-08-01)

## Kontext

Der Template-Editor braucht eine interaktive 2D-Canvas-Engine: Layer verschieben, zoomen,
rotieren, Live-Vorschau, Hit-Testing beim Klick auf einen Layer. Das Layer-Modell aus dem
Konzept (ImageLayer, ShapeLayer, IconLayer, FrameLayer, TextLayer) verlangt einen
Scene-Graph, keine reine Zeichenfläche.

Kandidaten: Konva.js, Fabric.js, PixiJS, Custom Canvas 2D API.

## Entscheidung

**Konva.js + `ng2-konva`.** Recherche (08/2026) bestätigt: Konva ist für Layer-basierte
Design-/Whiteboard-/Annotation-Tools die Standardwahl, mit offiziellem Angular-Binding,
eingebautem Drag/Drop, Transform-Handles (Resize/Rotate) und Event-Bubbling. Fabric.js zielt
stärker auf SVG-Export und Bildfilter, PixiJS auf GPU-beschleunigte Games/Visualisierungen —
beides am Bedarf hier vorbei. Custom Canvas 2D hätte Hit-Testing, Transform-Handles und
Undo/Redo komplett selbst gebaut bedeutet — unverhältnismäßiger Aufwand für den Editor-Kern.

## Konsequenzen

- Layer-Nodes im Frontend sind Konva-Nodes; Store hält die Konfiguration, Konva rendert
  daraus (siehe `docs/conventions/angular.md` → *Konva-Integration*)
- `shared/canvas/` kapselt alle `ng2-konva`-Aufrufe — Feature-Components binden nur
  Config-Objekte
- Bindung an Konvas Scene-Graph-Modell — ein späterer Wechsel auf PixiJS (z.B. bei
  Performance-Problemen mit sehr vielen Layern) wäre ein Rewrite des Canvas-Layers, nicht
  nur ein Bibliothekstausch
