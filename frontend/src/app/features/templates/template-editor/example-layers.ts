import {
  CircleShapeLayer,
  FrameLayer,
  IconLayer,
  ImageLayer,
  Layer,
  LineShapeLayer,
  RectShapeLayer,
  TextLayer,
  createLayer,
} from '../../../shared/canvas/rendering/layer';

/**
 * Wegwerf-Beispiel, damit die Vorschau schon geprüft werden kann, bevor es eine Oberfläche
 * zum Anlegen von Ebenen gibt. Fliegt raus, sobald die Ebenenliste echte Ebenen erzeugt.
 *
 * Reihenfolge = Zeichenreihenfolge: Der Hintergrund steht zuunterst, der Rahmen bewusst in
 * der Mitte (was danach kommt, liegt über ihm), die versteckte Ebene zeigt, dass
 * `visible: false` gar nicht erst gezeichnet wird.
 */
export function exampleLayers(): Layer[] {
  const background: RectShapeLayer = {
    ...createLayer('shape', 'rect'),
    name: 'Hintergrund',
    x: 20,
    y: 20,
    width: 590,
    height: 840,
    cornerRadius: 24,
    fill: '#101018',
    stroke: '#4a3dc4',
    strokeWidth: 6,
  };

  const title: TextLayer = {
    ...createLayer('text'),
    name: 'Titel',
    key: 'title',
    defaultText: 'Wächter des Dschungels',
    x: 60,
    y: 55,
    width: 510,
    height: 70,
    fontSize: 48,
    color: '#f5f5f7',
  };

  const artwork: ImageLayer = {
    ...createLayer('image'),
    name: 'Bildfläche',
    x: 60,
    y: 150,
    width: 510,
    height: 380,
  };

  const divider: LineShapeLayer = {
    ...createLayer('shape', 'line'),
    name: 'Trennlinie',
    points: [60, 560, 570, 560],
    stroke: '#6d5ef8',
    strokeWidth: 6,
  };

  const badge: CircleShapeLayer = {
    ...createLayer('shape', 'circle'),
    name: 'Abzeichen',
    x: 60,
    y: 600,
    width: 130,
    height: 130,
    rotation: 20,
    fill: '#6d5ef8',
    opacity: 0.85,
  };

  const frame: FrameLayer = { ...createLayer('frame'), name: 'Rahmen' };

  const blurb: TextLayer = {
    ...createLayer('text'),
    name: 'Beschreibung',
    key: 'blurb',
    defaultText:
      'Solange dieser Wächter im Spiel liegt, kann kein Gegner den Dschungelpfad betreten. ' +
      'Wird er besiegt, zieht sein Rudel eine neue Karte vom Stapel.',
    x: 220,
    y: 600,
    width: 350,
    height: 130,
    fontSize: 34,
    minFontSize: 14,
    align: 'left',
    verticalAlign: 'top',
    autoShrink: true,
    color: '#e2e2e8',
  };

  const rarity: IconLayer = {
    ...createLayer('icon'),
    name: 'Seltenheit',
    x: 460,
    y: 760,
    width: 110,
    height: 90,
    rotation: -8,
  };

  const hidden: TextLayer = {
    ...createLayer('text'),
    name: 'Ausgeblendet',
    key: 'hidden_note',
    defaultText: 'Diese Ebene darf nicht zu sehen sein.',
    visible: false,
    x: 60,
    y: 400,
    width: 510,
    height: 80,
    color: '#f24d4d',
  };

  return [background, title, artwork, divider, badge, frame, blurb, rarity, hidden];
}
