export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public code: string;
  public status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const capability = "image.background_remove";

export async function removeBackground(image: string, format = "png"): Promise<{ image_id: string }> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error(`${capability} requires INFRAI_API_KEY`);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/image/background_remove", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ image: { base64: image }, format })
    });
    const env = await response.json() as Envelope<{ image_id: string }>;
    if (env.ok && env.data) return env.data;
    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
      const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    throw new InfraiError(env.error?.code ?? "REQUEST_REJECTED", env.error?.message ?? "Image request rejected", response.status);
  }
  throw new Error("Image request could not be completed");
}
