import {
  MAX_ANSWER_CHARS,
  MAX_SENTENCES,
  MAX_SOURCE_CHARS,
  MIN_ANSWER_CHARS,
  MIN_SOURCE_CHARS,
} from "./schema";
import { splitSentences, type Sentence } from "./split";

export type InputOk = { ok: true; source: string; answer: string; sentences: Sentence[] };
export type InputErr = { ok: false; status: number; error: string };
export type InputCheck = InputOk | InputErr;

export function validateInput(body: { source?: unknown; answer?: unknown }): InputCheck {
  const source = typeof body.source === "string" ? body.source.trim() : "";
  const answer = typeof body.answer === "string" ? body.answer.trim() : "";

  if (!source || !answer) {
    return { ok: false, status: 400, error: "Provide both a source text and an AI answer." };
  }
  if (source.length < MIN_SOURCE_CHARS || answer.length < MIN_ANSWER_CHARS) {
    return {
      ok: false,
      status: 400,
      error: `The source needs at least ${MIN_SOURCE_CHARS} characters and the answer at least ${MIN_ANSWER_CHARS}.`,
    };
  }
  if (source.length > MAX_SOURCE_CHARS || answer.length > MAX_ANSWER_CHARS) {
    return {
      ok: false,
      status: 413,
      error: `Limits: source ${MAX_SOURCE_CHARS} characters, answer ${MAX_ANSWER_CHARS} characters.`,
    };
  }

  const sentences = splitSentences(answer);
  if (sentences.length === 0) {
    return { ok: false, status: 400, error: "The answer did not contain any sentences." };
  }
  if (sentences.length > MAX_SENTENCES) {
    return {
      ok: false,
      status: 400,
      error: `The answer has ${sentences.length} sentences; the limit is ${MAX_SENTENCES}.`,
    };
  }

  return { ok: true, source, answer, sentences };
}
