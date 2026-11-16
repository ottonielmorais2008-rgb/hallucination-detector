import type { Label, Score } from "./schema";

/** Groundedness is the percentage of sentences labelled supported, rounded to the nearest integer. */
export function computeScore(labels: Label[]): Score {
  const supported = labels.filter((l) => l === "supported").length;
  const notSupported = labels.filter((l) => l === "not_supported").length;
  const contradicted = labels.filter((l) => l === "contradicted").length;
  const total = labels.length;
  const groundedness = total === 0 ? 0 : Math.round((supported / total) * 100);
  return { supported, notSupported, contradicted, total, groundedness };
}
