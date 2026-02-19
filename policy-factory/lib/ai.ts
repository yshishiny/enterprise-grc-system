
import OpenAI from "openai";

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || "http://172.28.16.1:1234";
const GITHUB_MODELS_URL = "https://models.inference.ai.azure.com";

/**
 * Try LM Studio first (local, fast), fallback to GitHub Models.
 * At runtime the AI route will call this and get a working client.
 */
export function getAiClient(): OpenAI {
  // Prefer LM Studio when available
  return new OpenAI({
    baseURL: `${LM_STUDIO_URL}/v1`,
    apiKey: "lm-studio",            // LM Studio ignores the key
    dangerouslyAllowBrowser: true,
  });
}

/** Fallback to GitHub Models if LM Studio is down */
export function getGitHubAiClient(): OpenAI {
  const apiKey = process.env.GITHUB_TOKEN;
  if (!apiKey) {
    console.warn("⚠️ GITHUB_TOKEN not found. GitHub Models AI will be disabled.");
  }
  return new OpenAI({
    baseURL: GITHUB_MODELS_URL,
    apiKey: apiKey || "dummy-key-for-build",
    dangerouslyAllowBrowser: true,
  });
}

/** Smart client: tries LM Studio, falls back to GitHub */
export async function getSmartAiClient(): Promise<OpenAI> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${LM_STUDIO_URL}/v1/models`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) return getAiClient();
  } catch {
    // LM Studio unreachable — use GitHub
  }
  return getGitHubAiClient();
}
