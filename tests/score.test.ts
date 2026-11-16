import { describe, expect, it } from "vitest";
import { computeScore } from "../lib/score";

describe("computeScore", () => {
  it("returns 100 when every sentence is supported", () => {
    expect(computeScore(["supported", "supported"])).toEqual({
      supported: 2,
      notSupported: 0,
      contradicted: 0,
      total: 2,
      groundedness: 100,
    });
  });

  it("returns 0 for an empty list or for no supported sentences", () => {
    expect(computeScore([]).groundedness).toBe(0);
    expect(computeScore(["contradicted", "not_supported"]).groundedness).toBe(0);
  });

  it("rounds the supported percentage to the nearest integer", () => {
    expect(computeScore(["supported", "not_supported", "contradicted"]).groundedness).toBe(33);
    expect(computeScore(["supported", "supported", "not_supported"]).groundedness).toBe(67);
    expect(computeScore(["supported", "not_supported"]).groundedness).toBe(50);
  });

  it("counts each label separately", () => {
    const score = computeScore([
      "supported",
      "supported",
      "not_supported",
      "contradicted",
      "not_supported",
    ]);
    expect(score).toEqual({
      supported: 2,
      notSupported: 2,
      contradicted: 1,
      total: 5,
      groundedness: 40,
    });
  });
});
