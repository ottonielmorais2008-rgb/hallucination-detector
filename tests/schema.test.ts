import { describe, expect, it } from "vitest";
import { alignVerdicts } from "../lib/check";
import { checkResponseSchema, labelSchema, modelOutputSchema, sentenceVerdictSchema } from "../lib/schema";
import { validateInput } from "../lib/validate";
import { MAX_ANSWER_CHARS, MAX_SOURCE_CHARS } from "../lib/schema";

const validVerdict = {
  index: 0,
  sentence: "The tower opened in 1889.",
  label: "supported" as const,
  reason: "The source states the year.",
  quote: "completed in 1889",
};

describe("schema parsing", () => {
  it("accepts a well-formed verdict and model output", () => {
    expect(sentenceVerdictSchema.parse(validVerdict).label).toBe("supported");
    expect(modelOutputSchema.parse({ verdicts: [validVerdict] }).verdicts).toHaveLength(1);
    expect(labelSchema.safeParse("supported").success).toBe(true);
  });

  it("rejects invalid labels, negative indexes and missing reasons", () => {
    expect(labelSchema.safeParse("maybe").success).toBe(false);
    expect(sentenceVerdictSchema.safeParse({ ...validVerdict, index: -1 }).success).toBe(false);
    expect(sentenceVerdictSchema.safeParse({ ...validVerdict, reason: "" }).success).toBe(false);
    expect(modelOutputSchema.safeParse({ verdicts: [] }).success).toBe(false);
  });

  it("allows a null quote and accepts a full API response", () => {
    const verdict = { ...validVerdict, label: "not_supported" as const, quote: null };
    expect(sentenceVerdictSchema.parse(verdict).quote).toBeNull();
    const parsed = checkResponseSchema.safeParse({
      sentences: [{ text: verdict.sentence, start: 0, end: verdict.sentence.length }],
      verdicts: [verdict],
      score: { supported: 0, notSupported: 1, contradicted: 0, total: 1, groundedness: 0 },
      model: "gemini-3.5-flash-lite",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("validateInput", () => {
  const source = "Nimbus Labs launched the Atlas weather probe in March 2021 and it weighs 12 kilograms.";
  const answer = "Nimbus Labs launched the Atlas weather probe in March 2021.";

  it("accepts valid source and answer text and returns sentences", () => {
    const result = validateInput({ source, answer });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.sentences.length).toBeGreaterThan(0);
  });

  it("rejects missing, short or oversized inputs", () => {
    expect(validateInput({ source: "short", answer: "short" }).ok).toBe(false);
    expect(validateInput({ source: 1, answer: 2 }).ok).toBe(false);
    const tooLong = validateInput({ source: "x".repeat(MAX_SOURCE_CHARS + 1), answer });
    expect(tooLong.ok).toBe(false);
    if (!tooLong.ok) expect(tooLong.status).toBe(413);
    const longAnswer = validateInput({ source, answer: "y".repeat(MAX_ANSWER_CHARS + 1) });
    expect(longAnswer.ok).toBe(false);
    if (!longAnswer.ok) expect(longAnswer.status).toBe(413);
  });

  it("rejects answers that exceed the sentence limit", () => {
    const many = Array.from({ length: 41 }, (_, i) => `Fact number ${i} is recorded.`).join(" ");
    const result = validateInput({ source, answer: many });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });
});

describe("alignVerdicts", () => {
  const sentences = [
    { text: "Alpha is true.", start: 0, end: 14 },
    { text: "Beta is new.", start: 15, end: 27 },
  ];

  it("aligns by index, keeps our sentence text, and clears quotes on not_supported", () => {
    const aligned = alignVerdicts(sentences, {
      verdicts: [
        { index: 1, sentence: "ignored", label: "not_supported", reason: " Silent. ", quote: "should go" },
        { index: 0, sentence: "ignored", label: "supported", reason: "In the source.", quote: "Alpha is true" },
      ],
    });
    expect(aligned).toEqual([
      { index: 0, sentence: "Alpha is true.", label: "supported", reason: "In the source.", quote: "Alpha is true" },
      { index: 1, sentence: "Beta is new.", label: "not_supported", reason: "Silent.", quote: null },
    ]);
  });

  it("returns null when a sentence has no verdict", () => {
    expect(
      alignVerdicts(sentences, {
        verdicts: [{ index: 0, sentence: "Alpha is true.", label: "supported", reason: "ok", quote: "Alpha" }],
      }),
    ).toBeNull();
  });
});
