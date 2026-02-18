
import { NextResponse } from 'next/server';
import { getAiClient } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, system } = body;

    const ai = getAiClient();
    const completion = await ai.chat.completions.create({
      messages: [
        { role: "system", content: system || "You are an expert GRC consultant for Shari Microfinance." },
        { role: "user", content: prompt }
      ],
      model: "local-model",
    });

    return NextResponse.json({ 
      success: true, 
      content: completion.choices[0].message.content 
    });

  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to connect to AI service. Ensure LM Studio is running." },
      { status: 500 }
    );
  }
}
