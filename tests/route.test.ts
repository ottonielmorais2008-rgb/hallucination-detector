import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckResponse } from "../lib/schema";

vi.mock("../lib/check", () => ({
  checkAnswer: vi.fn(),
}));

import { checkAnswer } from "../lib/check";
import { apiRateLimiter, getClientIp, RateLimiter } from "../lib/rate-limit";
import { POST } from "../app/api/check/route";

const checkAnswerMock = vi.mocked(checkAnswer);

const source =
  "Nimbus Labs launched the Atlas weather probe in March 2021. The probe weighs 12 kilograms.";
const answer = "Nimbus Labs launched the Atlas weather probe in March 2021. The probe weighs 12 kilograms.";

const okResult: CheckResponse = {
  sentences: [
    { text: "Nimbus Labs launched the Atlas weather probe in March 2021.", start: 0, end: 59 },
    { text: "The probe weighs 12 kilograms.", start: 60, end: answer.length },
  ],
  verdicts: [
    {
      index: 0,
      sentence: "Nimbus Labs launched the Atlas weather probe in March 2021.",
      label: "supported",
      reason: "The source states the launch date.",
      quote: "launched the Atlas weather probe in March 2021",
    },
    {
      index: 1,
      sentence: "The probe weighs 12 kilograms.",
      label: "supported",
      reason: "The source states the weight.",
      quote: "weighs 12 kilograms",
    },
  ],
  score: { supported: 2, notSupported: 0, contradicted: 0, total: 2, groundedness: 100 },
  model: "gemini-3.5-flash-lite",
};

function makeRequest(body: unknown, init?: { ip?: string; contentLength?: string; raw?: string }): Request {
  const payload = init?.raw ?? JSON.stringify(body);
  const headers = new Headers({ "content-type": "application/json" });
  if (init?.ip) headers.set("x-forwarded-for", init.ip);
  if (init?.contentLength) headers.set("content-length", init.contentLength);
  return new Request("http://localhost/api/check", { method: "POST", headers, body: payload });
}

async function read(res: Response): Promise<{ status: number; body: Record<string, unknown> }> {
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

describe("RateLimiter and getClientIp", () => {
  it("allows up to the max hits in a window and then blocks", () => {
    const limiter = new RateLimiter(1_000, 2);
    expect(limiter.allow("a", 0)).toBe(true);
    expect(limiter.allow("a", 10)).toBe(true);
    expect(limiter.allow("a", 20)).toBe(false);
    expect(limiter.allow("a", 1_010)).toBe(true);
  });

  it("reads the first forwarded IP and falls back to unknown", () => {
    const forwarded = new Request("http://localhost", {
      headers: { "x-forwarded-for": " 1.1.1.1, 2.2.2.2" },
    });
    expect(getClientIp(forwarded)).toBe("1.1.1.1");
    expect(getClientIp(new Request("http://localhost"))).toBe("unknown");
  });
});

describe("POST /api/check", () => {
  beforeEach(() => {
    apiRateLimiter.reset();
    checkAnswerMock.mockReset();
  });

  it("returns 400 for invalid JSON", async () => {
    const { status, body } = await read(await POST(makeRequest({}, { raw: "{not-json" })));
    expect(status).toBe(400);
    expect(body.error).toMatch(/json/i);
    expect(checkAnswerMock).not.toHaveBeenCalled();
  });

  it("returns 400 for short input and 413 when over the size limits", async () => {
    const short = await read(await POST(makeRequest({ source: "too short", answer: "also short" }, { ip: "10.0.0.1" })));
    expect(short.status).toBe(400);

    const oversized = await read(await POST(makeRequest({ source, answer }, { ip: "10.0.0.2", contentLength: "20001" })));
    expect(oversized.status).toBe(413);

    const long = await read(
      await POST(makeRequest({ source: "x".repeat(8001), answer }, { ip: "10.0.0.3" })),
    );
    expect(long.status).toBe(413);
    expect(checkAnswerMock).not.toHaveBeenCalled();
  });

  it("returns the labelled result from the model helper", async () => {
    checkAnswerMock.mockResolvedValue(okResult);
    const { status, body } = await read(await POST(makeRequest({ source, answer }, { ip: "10.0.0.4" })));
    expect(status).toBe(200);
    expect(body.score).toEqual(okResult.score);
    expect(body.verdicts).toHaveLength(2);
    expect(checkAnswerMock).toHaveBeenCalledOnce();
  });

  it("returns 502 when the model fails", async () => {
    checkAnswerMock.mockRejectedValue(new Error("model down"));
    const { status, body } = await read(await POST(makeRequest({ source, answer }, { ip: "10.0.0.5" })));
    expect(status).toBe(502);
    expect(String(body.error)).toMatch(/could not be completed/i);
  });

  it("returns 429 after the per-IP request budget is used", async () => {
    checkAnswerMock.mockResolvedValue(okResult);
    const ip = "203.0.113.9";
    for (let i = 0; i < 8; i++) {
      const res = await POST(makeRequest({ source, answer }, { ip }));
      expect(res.status).toBe(200);
    }
    const blocked = await read(await POST(makeRequest({ source, answer }, { ip })));
    expect(blocked.status).toBe(429);
    expect(checkAnswerMock).toHaveBeenCalledTimes(8);
  });
});
