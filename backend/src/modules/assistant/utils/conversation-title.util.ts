const STOP_WORDS = new Set([
  'a',
  'al',
  'an',
  'and',
  'ayuda',
  'ayudame',
  'ayúdame',
  'como',
  'cómo',
  'con',
  'de',
  'del',
  'el',
  'en',
  'for',
  'help',
  'hola',
  'i',
  'la',
  'las',
  'lo',
  'los',
  'me',
  'mi',
  'mis',
  'esta',
  'este',
  'estos',
  'estas',
  'my',
  'necesito',
  'o',
  'para',
  'por',
  'que',
  'quiero',
  'se',
  'the',
  'to',
  'un',
  'una',
  'y',
  'yo',
]);

const MAX_TITLE_LEN = 10;
const MAX_KEYWORDS = 2;


export function buildConversationTitleFromMessage(message: string): string {
  const clean = message.replace(/\s+/g, ' ').trim();
  if (!clean) {
    return 'Nueva conversación';
  }

  const words = clean
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  if (words.length === 0) {
    const fallback =
      clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    return truncateTitle(fallback);
  }

  const phrase = words.slice(0, MAX_KEYWORDS).join(' ');
  const titled = phrase.charAt(0).toUpperCase() + phrase.slice(1);
  return truncateTitle(titled);
}

function truncateTitle(title: string): string {
  if (title.length <= MAX_TITLE_LEN) {
    return title;
  }
  return `${title.slice(0, MAX_TITLE_LEN - 3).trimEnd()}...`;
}
