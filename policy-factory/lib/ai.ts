
import OpenAI from "openai";

// Configure for GitHub Models (Lazy Load)
export function getAiClient() {
  const apiKey = process.env.GITHUB_TOKEN;
  if (!apiKey) {
    console.warn("⚠️ GITHUB_TOKEN not found. AI features will be disabled.");
    // Return a dummy or throw a clear error
    // For build safety, return a mock or allow it to fail at runtime
  }

  return new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: apiKey || "dummy-key-for-build", 
    dangerouslyAllowBrowser: true
  });
}

