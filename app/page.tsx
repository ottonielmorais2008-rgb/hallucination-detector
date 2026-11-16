"use client";

import { useMemo, useState } from "react";
import { examples } from "../lib/examples";
import {
  MAX_ANSWER_CHARS,
  MAX_SOURCE_CHARS,
  type CheckResponse,
  type Label,
} from "../lib/schema";

const LABEL_STYLE: Record<Label, { text: string; bg: string; name: string }> = {
  supported: { text: "text-[#147a4a]", bg: "bg-[#d8f3e4]", name: "Supported" },
  not_supported: { text: "text-[#9a6b12]", bg: "bg-[#f8e8c4]", name: "Not supported" },
  contradicted: { text: "text-[#b42318]", bg: "bg-[#fde4e1]", name: "Contradicted" },
};

export default function Home() {
  const [source, setSource] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [activeExample, setActiveExample] = useState<string | null>(null);

  function loadExample(id: string) {
    const ex = examples.find((e) => e.id === id);
    if (!ex) return;
    setActiveExample(id);
    setSource(ex.source);
    setAnswer(ex.answer);
    setResult(null);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = source.trim().length >= 40 && answer.trim().length >= 20 && !loading;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-[#0f6e6b] uppercase">Fact check</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl leading-tight font-semibold sm:text-5xl">
          Hallucination Detector
        </h1>
        <p className="mt-3 text-lg text-[#57534e]">
          Paste a source text and an AI answer. Each sentence is labelled as supported, not supported, or
          contradicted by the source, with a short reason.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        {examples.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => loadExample(ex.id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              activeExample === ex.id
                ? "border-[#0f6e6b] bg-[#0f6e6b] text-white"
                : "border-[#e0d6c8] bg-white text-[#1c1917] hover:border-[#0f6e6b]"
            }`}
          >
            {ex.title}
            <span className="ml-2 hidden text-[#57534e] sm:inline">{ex.blurb}</span>
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <Field
          label="Source text"
          value={source}
          onChange={setSource}
          max={MAX_SOURCE_CHARS}
          placeholder="Paste the source the answer should be grounded in..."
        />
        <Field
          label="AI answer"
          value={answer}
          onChange={setAnswer}
          max={MAX_ANSWER_CHARS}
          placeholder="Paste the model output you want to check..."
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-[#0f6e6b] px-5 py-3 font-semibold text-white transition hover:bg-[#0c5a58] disabled:opacity-50 md:col-span-2"
        >
          {loading ? "Checking sentences..." : "Check against source"}
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-xl border border-[#f0c0ba] bg-[#fde4e1] p-4 text-[#b42318]" role="alert">
          {error}
        </p>
      )}

      {result && <ResultPanel result={result} answer={answer} />}

      <footer className="mt-14 border-t border-[#e0d6c8] pt-6 text-sm text-[#57534e]">
        Nothing is stored. The source and answer are sent to the model only to produce the labels, then discarded.{" "}
        <a className="underline decoration-[#0f6e6b] underline-offset-2" href="https://github.com/ottonielmorais2008-rgb/hallucination-detector">
          Source code
        </a>
      </footer>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  max,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-baseline justify-between font-semibold">
        {label}
        <span className="text-xs font-normal text-[#57534e]">
          {value.length}/{max}
        </span>
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={max}
        rows={12}
        placeholder={placeholder}
        className="rounded-xl border border-[#e0d6c8] bg-white p-3 text-sm leading-relaxed focus:border-[#0f6e6b] focus:outline-none"
      />
    </label>
  );
}

function ResultPanel({ result, answer }: { result: CheckResponse; answer: string }) {
  const { score } = result;
  const scoreColor =
    score.groundedness >= 70 ? "text-[#147a4a]" : score.groundedness >= 40 ? "text-[#9a6b12]" : "text-[#b42318]";

  return (
    <section className="mt-10 space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm sm:col-span-1">
          <p className="text-sm text-[#57534e]">Groundedness</p>
          <p className={`font-[family-name:var(--font-display)] text-5xl font-semibold ${scoreColor}`}>
            {score.groundedness}%
          </p>
          <p className="mt-1 text-xs text-[#57534e]">share of supported sentences</p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:col-span-3">
          <Stat label="Supported" value={score.supported} tone="text-[#147a4a] bg-[#d8f3e4]" />
          <Stat label="Not supported" value={score.notSupported} tone="text-[#9a6b12] bg-[#f8e8c4]" />
          <Stat label="Contradicted" value={score.contradicted} tone="text-[#b42318] bg-[#fde4e1]" />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">Highlighted answer</h2>
        <HighlightedAnswer result={result} answer={answer} />
        <Legend />
      </div>

      <ol className="space-y-3">
        {result.verdicts.map((v) => {
          const style = LABEL_STYLE[v.label];
          return (
            <li key={v.index} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}>
                  {style.name}
                </span>
                <p className="font-medium">{v.sentence}</p>
              </div>
              <p className="mt-2 text-sm text-[#57534e]">{v.reason}</p>
              {v.quote && (
                <blockquote className="mt-2 border-l-2 border-[#0f6e6b] pl-3 text-sm text-[#1c1917] italic">
                  “{v.quote}”
                </blockquote>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`flex flex-col justify-center rounded-2xl p-4 ${tone}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="font-[family-name:var(--font-display)] text-3xl font-semibold">{value}</p>
    </div>
  );
}

function HighlightedAnswer({ result, answer }: { result: CheckResponse; answer: string }) {
  const chunks = useMemo(() => {
    const byStart = [...result.sentences].sort((a, b) => a.start - b.start);
    const parts: { text: string; label: Label | null; key: string }[] = [];
    let cursor = 0;
    byStart.forEach((sentence, i) => {
      if (sentence.start > cursor) {
        parts.push({ text: answer.slice(cursor, sentence.start), label: null, key: `gap-${i}` });
      }
      const verdict = result.verdicts.find((v) => v.index === i) ?? result.verdicts[i];
      parts.push({
        text: answer.slice(sentence.start, sentence.end),
        label: verdict?.label ?? null,
        key: `s-${i}`,
      });
      cursor = sentence.end;
    });
    if (cursor < answer.length) {
      parts.push({ text: answer.slice(cursor), label: null, key: "tail" });
    }
    return parts;
  }, [result, answer]);

  return (
    <p className="mt-3 text-lg leading-relaxed">
      {chunks.map((chunk) =>
        chunk.label ? (
          <mark
            key={chunk.key}
            className={`rounded-sm px-0.5 ${LABEL_STYLE[chunk.label].bg} ${LABEL_STYLE[chunk.label].text}`}
            title={LABEL_STYLE[chunk.label].name}
          >
            {chunk.text}
          </mark>
        ) : (
          <span key={chunk.key}>{chunk.text}</span>
        ),
      )}
    </p>
  );
}

function Legend() {
  return (
    <ul className="mt-4 flex flex-wrap gap-4 text-xs text-[#57534e]">
      {(Object.keys(LABEL_STYLE) as Label[]).map((label) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className={`inline-block h-2.5 w-2.5 rounded-sm ${LABEL_STYLE[label].bg}`} />
          {LABEL_STYLE[label].name}
        </li>
      ))}
    </ul>
  );
}
