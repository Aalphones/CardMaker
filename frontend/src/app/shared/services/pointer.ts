/**
 * Ob das Gerät mit grobem Zeiger (Finger) bedient wird — dieselbe Abfrage wie das
 * Mixin `bp.touch` in `styles/_breakpoints.scss` (ADR-028). Einmal je Aufruf gelesen, kein
 * Signal: ein Gerät wechselt seinen Zeiger nicht während der Bearbeitung.
 */
export function isCoarsePointer(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
}
