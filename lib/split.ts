export type Sentence = { text: string; start: number; end: number };

const ABBREVIATIONS = new Set([
  "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "vs", "etc", "inc", "ltd",
  "no", "fig", "al", "st", "ave", "dept", "est", "vol", "pp", "pg", "approx",
]);

const MULTI_ABBREVIATIONS = new Set(["e.g", "i.e", "u.s", "u.k", "n.y", "p.s", "a.m", "p.m"]);

function isEndPunct(c: string): boolean {
  return c === "." || c === "!" || c === "?";
}

function isClosingQuote(c: string): boolean {
  return c === '"' || c === "'" || c === "”" || c === "’" || c === "»";
}

function wordBeforePeriod(text: string, periodIndex: number): string {
  let i = periodIndex - 1;
  while (i >= 0 && /[A-Za-z.]/.test(text[i]!)) i--;
  return text.slice(i + 1, periodIndex).toLowerCase();
}

function isAbbreviation(text: string, periodIndex: number): boolean {
  if (periodIndex > 0 && /\d/.test(text[periodIndex - 1]!) && periodIndex + 1 < text.length && /\d/.test(text[periodIndex + 1]!)) {
    return true;
  }
  const word = wordBeforePeriod(text, periodIndex);
  if (!word) return false;
  if (ABBREVIATIONS.has(word)) return true;
  if (MULTI_ABBREVIATIONS.has(word)) return true;
  // Single-letter initials: "A. Einstein", "U.S."
  if (/^[a-z](?:\.[a-z])*$/.test(word)) return true;
  return false;
}

function pushSentence(sentences: Sentence[], text: string, from: number, to: number): void {
  const raw = text.slice(from, to);
  const trimmed = raw.trim();
  if (!trimmed) return;
  const lead = raw.length - raw.trimStart().length;
  const start = from + lead;
  sentences.push({ text: trimmed, start, end: start + trimmed.length });
}

/** Split text into sentences, preserving character offsets in the original string. */
export function splitSentences(text: string): Sentence[] {
  const sentences: Sentence[] = [];
  let start = 0;

  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (!isEndPunct(c)) continue;

    if (c === "." && isAbbreviation(text, i)) continue;

    let end = i + 1;
    while (end < text.length && (isEndPunct(text[end]!) || isClosingQuote(text[end]!))) end++;

    let j = end;
    while (j < text.length && /\s/.test(text[j]!)) j++;
    const atEnd = j >= text.length;
    const next = atEnd ? "" : text[j]!;
    const looksLikeNewSentence = atEnd || /[A-Z0-9“"'(]/.test(next);
    if (!looksLikeNewSentence) continue;

    pushSentence(sentences, text, start, end);
    start = end;
    i = end - 1;
  }

  pushSentence(sentences, text, start, text.length);
  return sentences;
}
