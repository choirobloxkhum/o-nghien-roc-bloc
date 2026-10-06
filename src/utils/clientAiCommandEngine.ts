import { GoogleGenAI } from '@google/genai';
import { AI_SYSTEM_INSTRUCTION } from '../constants/aiInstructions';

// Candidate models in priority order
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
];

export async function generateClientRPDirective(
  messages: Array<{ role: 'user' | 'model' | 'assistant'; content: string }>,
  customApiKey?: string
): Promise<string> {
  const apiKey = customApiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('Chưa cấu hình VITE_GEMINI_API_KEY cho môi trường Static / GitHub Pages.');
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: AI_SYSTEM_INSTRUCTION,
          temperature: 0.75,
          maxOutputTokens: 8192,
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Client-Side AI] Model ${modelName} encountered error, trying fallback...`, err);
    }
  }

  throw lastError || new Error('Không thể kết nối tới Google Gemini API.');
}
