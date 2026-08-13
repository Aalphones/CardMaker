/**
 * Der Browser gibt keinen Druckauftrag ohne Dialog heraus — der Dialog IST die Erlaubnis.
 * Sparen lässt sich nur der Umweg über die Festplatte: PDF in einen unsichtbaren Rahmen,
 * dessen `print()` rufen, Dialog steht. Klappt das nicht, gibt die Funktion `false` zurück
 * und der Aufrufer lädt herunter wie bisher.
 */

/** Ohne Ladeereignis in dieser Zeit gilt der Weg als gescheitert. */
const FRAME_LOAD_TIMEOUT_MS = 10_000;

/**
 * Chrome braucht nach dem Ladeereignis noch einen Tick, bis sein PDF-Betrachter im Rahmen
 * ansprechbar ist; ohne die Pause bleibt der Dialog gelegentlich leer.
 */
const PRINT_DELAY_MS = 100;

/** Rahmen und Objekt-Adresse müssen den offenen Dialog überleben — er hängt am Inhalt. */
const CLEANUP_DELAY_MS = 60_000;

export function printPdfBlob(blob: Blob): Promise<boolean> {
  if (!printsPdfInFrame()) {
    return Promise.resolve(false);
  }

  return new Promise((resolve: (value: boolean) => void) => {
    const url = URL.createObjectURL(blob);
    const frame = createHiddenFrame();
    let settled = false;

    const finish = (printed: boolean): void => {
      if (settled) {
        return;
      }

      settled = true;
      setTimeout(() => {
        frame.remove();
        URL.revokeObjectURL(url);
      }, CLEANUP_DELAY_MS);
      resolve(printed);
    };

    frame.onload = (): void => {
      setTimeout(() => finish(openPrintDialog(frame)), PRINT_DELAY_MS);
    };
    frame.onerror = (): void => finish(false);
    setTimeout(() => finish(false), FRAME_LOAD_TIMEOUT_MS);

    frame.src = url;
    document.body.appendChild(frame);
  });
}

/**
 * Firefox und Safari zeigen PDFs im Rahmen über ihren eigenen Betrachter an, der auf einen
 * Druckbefehl von außen nicht reagiert — dort wird gar nicht erst versucht, sonst passiert
 * beim Klick sichtbar nichts.
 */
function printsPdfInFrame(): boolean {
  const agent = navigator.userAgent;
  const isFirefox = agent.includes('Firefox');
  const isSafari =
    agent.includes('Safari') && !agent.includes('Chrome') && !agent.includes('Chromium');

  return !isFirefox && !isSafari;
}

function createHiddenFrame(): HTMLIFrameElement {
  const frame = document.createElement('iframe');

  // Nicht `display: none` — ohne Layout lädt der eingebaute PDF-Betrachter nicht.
  frame.setAttribute(
    'style',
    'position: fixed; inset-block-end: 0; inset-inline-end: 0; ' +
      'width: 1px; height: 1px; border: 0; opacity: 0;',
  );
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('tabindex', '-1');

  return frame;
}

function openPrintDialog(frame: HTMLIFrameElement): boolean {
  const frameWindow = frame.contentWindow;

  if (frameWindow === null) {
    return false;
  }

  try {
    frameWindow.focus();
    frameWindow.print();

    return true;
  } catch {
    return false;
  }
}
