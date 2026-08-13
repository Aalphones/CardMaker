const UMLAUT_REPLACEMENTS: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
};

const FALLBACK_FILE_NAME = 'karte.png';

/** Kartenname → Dateiname: klein, Umlaute ausgeschrieben, Leerzeichen zu Bindestrichen, Rest weg. */
export function cardFileName(name: string): string {
  const lowercase = name.toLowerCase().replace(
    /[äöüß]/g,
    (char: string) => UMLAUT_REPLACEMENTS[char] ?? char,
  );
  const slug = lowercase.trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return slug === '' ? FALLBACK_FILE_NAME : `${slug}.png`;
}
