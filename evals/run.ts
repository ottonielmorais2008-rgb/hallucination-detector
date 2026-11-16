import { writeFileSync } from "node:fs";
import { checkAnswer } from "../lib/check";
import { splitSentences } from "../lib/split";
import { evalCases } from "./cases";

type Row = {
  id: string;
  expected: string[];
  predicted: string[];
  correct: number;
  total: number;
  errors: { index: number; sentence: string; expected: string; predicted: string }[];
};

async function main() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("Set GOOGLE_GENERATIVE_AI_API_KEY to run the eval.");
  }

  for (const c of evalCases) {
    const sentences = splitSentences(c.answer);
    if (sentences.length !== c.expected.length) {
      throw new Error(
        `Case ${c.id}: expected ${c.expected.length} labels but the splitter produced ${sentences.length} sentences: ${sentences.map((s) => s.text).join(" | ")}`,
      );
    }
  }

  const model = process.env.GOOGLE_MODEL ?? "gemini-3.5-flash-lite";
  const rows: Row[] = [];

  for (const c of evalCases) {
    const sentences = splitSentences(c.answer);
    const result = await checkAnswer(c.source, sentences);
    const predicted = result.verdicts.map((v) => v.label);
    const errors = c.expected.flatMap((expected, index) => {
      const got = predicted[index] ?? "(missing)";
      if (got === expected) return [];
      return [{ index, sentence: sentences[index]!.text, expected, predicted: got }];
    });
    rows.push({
      id: c.id,
      expected: c.expected,
      predicted,
      correct: c.expected.length - errors.length,
      total: c.expected.length,
      errors,
    });
    const mark = errors.length === 0 ? "ok" : "miss";
    console.log(`${mark} ${c.id}: ${rows.at(-1)!.correct}/${rows.at(-1)!.total}`);
  }

  const total = rows.reduce((n, r) => n + r.total, 0);
  const correct = rows.reduce((n, r) => n + r.correct, 0);
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 1000) / 10;
  const date = new Date().toISOString().slice(0, 10);

  const lines: string[] = [
    "# Eval results",
    "",
    `Model: \`${model}\``,
    `Date: ${date}`,
    `Cases: ${rows.length}`,
    `Sentences: ${total}`,
    `Accuracy: ${accuracy}% (${correct}/${total} sentence labels correct)`,
    "",
    "Each case has a source, an answer and a gold label per sentence (`supported`, `not_supported`, or `contradicted`). The eval calls the same `checkAnswer` helper as the API.",
    "",
    "| Case | Sentences | Correct | Accuracy |",
    "| --- | ---: | ---: | ---: |",
  ];

  for (const row of rows) {
    const pct = Math.round((row.correct / row.total) * 1000) / 10;
    lines.push(`| ${row.id} | ${row.total} | ${row.correct} | ${pct}% |`);
  }

  lines.push("", "## Mismatches", "");
  const mismatches = rows.filter((r) => r.errors.length > 0);
  if (mismatches.length === 0) {
    lines.push("None. Every labelled sentence matched the model output.");
  } else {
    for (const row of mismatches) {
      lines.push(`### ${row.id}`, "");
      for (const err of row.errors) {
        lines.push(`- Sentence ${err.index}: expected \`${err.expected}\`, got \`${err.predicted}\` — "${err.sentence}"`);
      }
      lines.push("");
    }
  }

  lines.push(
    "## Notes",
    "",
    "This is a small synthetic set, run once. It is not a benchmark of general hallucination detection. No user text and no API keys are stored in this file.",
    "",
  );

  writeFileSync(new URL("./results.md", import.meta.url), lines.join("\n"));
  writeFileSync(new URL("./results.json", import.meta.url), `${JSON.stringify({ model, date, accuracy, correct, total, rows }, null, 2)}\n`);
  console.log(`\nAccuracy: ${accuracy}% (${correct}/${total})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
