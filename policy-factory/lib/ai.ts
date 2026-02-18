
import OpenAI from "openai";

// Configure for Local LM Studio
// LM Studio usually runs on port 1234
const ai = new OpenAI({
  baseURL: "http://localhost:1234/v1",
  apiKey: "lm-studio", // Not used locally but required by SDK
  dangerouslyAllowBrowser: true // Allow running in Next.js client-side if needed (though API routes are safer)
});

export default ai;
