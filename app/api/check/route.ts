import { checkAnswer } from "../../../lib/check";
import { apiRateLimiter, getClientIp } from "../../../lib/rate-limit";
import { MAX_BODY_BYTES } from "../../../lib/schema";
import { validateInput } from "../../../lib/validate";

export const maxDuration = 30;

function tooLarge(req: Request): boolean {
  const length = req.headers.get("content-length");
  if (length && Number(length) > MAX_BODY_BYTES) return true;
  return false;
}

export async function POST(req: Request): Promise<Response> {
  if (tooLarge(req)) {
    return Response.json({ error: "Request body is too large." }, { status: 413 });
  }

  const ip = getClientIp(req);
  if (!apiRateLimiter.allow(ip)) {
    return Response.json({ error: "Too many requests. Please wait a minute and try again." }, { status: 429 });
  }

  let body: { source?: unknown; answer?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = validateInput(body);
  if (!input.ok) return Response.json({ error: input.error }, { status: input.status });

  try {
    const result = await checkAnswer(input.source, input.sentences);
    return Response.json(result);
  } catch (err) {
    console.error("check failed", err);
    return Response.json(
      { error: "The check could not be completed. Please try again in a moment." },
      { status: 502 },
    );
  }
}
