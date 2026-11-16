import { describe, expect, it } from "vitest";
import { splitSentences } from "../lib/split";

describe("splitSentences", () => {
  it("splits plain sentences and keeps original offsets", () => {
    const text = "The tower opened in 1889. Gustave Eiffel designed it.";
    const sentences = splitSentences(text);
    expect(sentences.map((s) => s.text)).toEqual([
      "The tower opened in 1889.",
      "Gustave Eiffel designed it.",
    ]);
    for (const s of sentences) {
      expect(text.slice(s.start, s.end)).toBe(s.text);
    }
  });

  it("treats questions and exclamations as sentence ends", () => {
    const text = "Is it tall? Yes! It is made of iron.";
    expect(splitSentences(text).map((s) => s.text)).toEqual([
      "Is it tall?",
      "Yes!",
      "It is made of iron.",
    ]);
  });

  it("does not split on titles such as Dr.", () => {
    const text = "Dr. Smith went home. He was tired.";
    expect(splitSentences(text).map((s) => s.text)).toEqual([
      "Dr. Smith went home.",
      "He was tired.",
    ]);
  });

  it("does not split decimal numbers", () => {
    const text = "The probe weighs 12.5 kilograms. It is small.";
    expect(splitSentences(text).map((s) => s.text)).toEqual([
      "The probe weighs 12.5 kilograms.",
      "It is small.",
    ]);
  });

  it("does not split initials or U.S.-style abbreviations", () => {
    const text = "The paper is by A. Turing. It influenced the U.S. debate. Later work followed.";
    expect(splitSentences(text).map((s) => s.text)).toEqual([
      "The paper is by A. Turing.",
      "It influenced the U.S. debate.",
      "Later work followed.",
    ]);
  });

  it("keeps a single sentence with no trailing period", () => {
    expect(splitSentences("Just one clause").map((s) => s.text)).toEqual(["Just one clause"]);
  });

  it("returns no sentences for empty or whitespace input", () => {
    expect(splitSentences("")).toEqual([]);
    expect(splitSentences("   \n\t  ")).toEqual([]);
  });

  it("trims surrounding whitespace but preserves in-source offsets", () => {
    const text = "  Hello there.   Next sentence.  ";
    const sentences = splitSentences(text);
    expect(sentences.map((s) => s.text)).toEqual(["Hello there.", "Next sentence."]);
    expect(text.slice(sentences[0]!.start, sentences[0]!.end)).toBe("Hello there.");
    expect(text.slice(sentences[1]!.start, sentences[1]!.end)).toBe("Next sentence.");
  });
});
