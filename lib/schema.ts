import { z } from "zod";

export const MAX_SOURCE_CHARS = 8000;
export const MAX_ANSWER_CHARS = 4000;
export const MIN_SOURCE_CHARS = 40;
export const MIN_ANSWER_CHARS = 20;
export const MAX_SENTENCES = 40;
export const MAX_BODY_BYTES = 20_000;

export const labelSchema = z.enum(["supported", "not_supported", "contradicted"]);
export type Label = z.infer<typeof labelSchema>;

export const sentenceVerdictSchema = z.object({
  index: z.number().int().min(0),
  sentence: z.string(),
  label: labelSchema,
  reason: z.string().min(1),
  quote: z.string().nullable(),
});
export type SentenceVerdict = z.infer<typeof sentenceVerdictSchema>;

export const modelOutputSchema = z.object({
  verdicts: z.array(sentenceVerdictSchema).min(1),
});
export type ModelOutput = z.infer<typeof modelOutputSchema>;

export const scoreSchema = z.object({
  supported: z.number().int().min(0),
  notSupported: z.number().int().min(0),
  contradicted: z.number().int().min(0),
  total: z.number().int().min(0),
  groundedness: z.number().int().min(0).max(100),
});
export type Score = z.infer<typeof scoreSchema>;

export const checkResponseSchema = z.object({
  sentences: z.array(
    z.object({
      text: z.string(),
      start: z.number().int().min(0),
      end: z.number().int().min(0),
    }),
  ),
  verdicts: z.array(sentenceVerdictSchema),
  score: scoreSchema,
  model: z.string(),
});
export type CheckResponse = z.infer<typeof checkResponseSchema>;
