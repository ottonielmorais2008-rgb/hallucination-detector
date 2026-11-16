# Eval results

Model: `gemini-3.5-flash-lite`
Date: 2026-11-16
Cases: 10
Sentences: 26
Accuracy: 92.3% (24/26 sentence labels correct)

Each case has a source, an answer and a gold label per sentence (`supported`, `not_supported`, or `contradicted`). The eval calls the same `checkAnswer` helper as the API.

| Case | Sentences | Correct | Accuracy |
| --- | ---: | ---: | ---: |
| all-supported-tower | 3 | 3 | 100% |
| mixed-nimbus | 4 | 4 | 100% |
| otter-contradictions | 4 | 4 | 100% |
| paraphrase-supported | 2 | 2 | 100% |
| invented-date | 2 | 2 | 100% |
| number-swap | 2 | 2 | 100% |
| negation | 2 | 2 | 100% |
| all-not-supported | 2 | 0 | 0% |
| implied-founder | 2 | 2 | 100% |
| extra-and-wrong-weight | 3 | 3 | 100% |

## Mismatches

### all-not-supported

- Sentence 0: expected `not_supported`, got `contradicted` — "The orchard also grows oranges."
- Sentence 1: expected `not_supported`, got `contradicted` — "A juice factory next door bottles the fruit for export."

## Notes

This is a small synthetic set, run once. It is not a benchmark of general hallucination detection. No user text and no API keys are stored in this file.
