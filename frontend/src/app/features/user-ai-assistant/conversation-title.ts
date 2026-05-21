const STOP_WORDS = new Set([
  'a', 'al', 'an', 'and', 'ayuda', 'ayudame', 'ayúdame', 'como', 'cómo', 'con', 'de', 'del',
  'el', 'en', 'for', 'help', 'hola', 'i', 'la', 'las', 'lo', 'los', 'me', 'mi', 'mis', 'esta',
  'este', 'estos', 'estas', 'my', 'necesito', 'o', 'para', 'por', 'que', 'quiero', 'se', 'the',
  'to', 'un', 'una', 'y', 'yo',
]);

const MAX_LEN = 10;
const MAX_KEYWORDS = 2;


export function previewConversationTitle(message: string): string {
  const clean = message.replace(/\s+/g, ' ').trim();
  if (!clean) return '';

  const words = clean
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const phrase =
    words.length > 0
      ? words.slice(0, MAX_KEYWORDS).join(' ')
      : clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  const titled = words.length > 0 ? phrase.charAt(0).toUpperCase() + phrase.slice(1) : phrase;
  return titled.length > MAX_LEN
    ? `${titled.slice(0, MAX_LEN - 3).trimEnd()}...`
    : titled;
}
