/**
 * Objekt-Adresse erzeugen, unsichtbares `<a download>` klicken, Adresse danach wieder
 * freigeben — sonst bleibt der Blob im Speicher hängen. Der `setTimeout` gibt dem Browser
 * die Zeit, den Klick tatsächlich als Download zu starten, bevor die Adresse verschwindet.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
