import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';
import { AI_SYSTEM_INSTRUCTION } from './src/constants/aiInstructions';

export { AI_SYSTEM_INSTRUCTION };

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface ChatMessagePayload {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
];

export async function generateRPDirective(messages: ChatMessagePayload[]) {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      console.log(`[AI Directive Engine] Attempting generation with model: ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: AI_SYSTEM_INSTRUCTION,
          temperature: 0.7,
          topP: 0.95,
        },
      });

      if (response && response.text) {
        console.log(`[AI Directive Engine] Successfully generated with model: ${model}`);
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[AI Directive Engine] Model ${model} encountered error:`, err?.message || err);
      lastError = err;
      // Continue to next fallback model
    }
  }

  throw lastError || new Error('Không thể kết nối đến AI model lúc này.');
}
