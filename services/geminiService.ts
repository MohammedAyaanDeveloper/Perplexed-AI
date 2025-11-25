import { GoogleGenAI } from "@google/genai";
import { Message, Source } from "../types";

// Initialize the API client
const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  useMock: boolean
): Promise<{ text: string; sources: Source[] }> => {
  
  // 1. Mock Mode Handling
  if (useMock) {
    // Simulate network latency (0.5s to 2s)
    const delay = 500 + Math.random() * 1500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      text: generateMockResponse(newMessage),
      sources: []
    };
  }

  // 2. Real API Handling
  if (!apiKey || !ai) {
    throw new Error("Gemini API Key is missing. Please set process.env.API_KEY or enable Mock Mode.");
  }

  try {
    const model = 'gemini-2.5-flash';
    
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        temperature: 0.7,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "No response generated.";
    
    // Extract Sources from Grounding Metadata
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Web Source",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// Helper for Canned Responses
const generateMockResponse = (input: string): string => {
  const lower = input.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi')) {
    return "Hello! I am running in **Mock Mode**. I don't have a real brain connected right now, but I can pretend to listen! How can I help you simulate a task today?";
  }

  if (lower.includes('plan') || lower.includes('subscription') || lower.includes('pro')) {
    return "You can upgrade to the **Pro Plan** in this demo app. Go to the sidebar and click 'Upgrade' to see the dummy payment flow!";
  }

  if (lower.includes('code') || lower.includes('javascript') || lower.includes('python')) {
    return "Here is a mock code snippet for you:\n\n```typescript\n// This is a dummy function\nfunction simulateAI() {\n  return 'This is not real generated code!';\n}\n```\n\nIn Mock Mode, I cannot execute or generate real code logic, but I can show you how it looks!";
  }

  return `This is a **dummy response** for your query: _"${input}"_.\n\nCurrently, **Mock API Mode** is enabled. No real data is being sent to Google Gemini.\n\n### Why am I seeing this?\n- You are testing the UI without an API key.\n- Or you have explicitly enabled Mock Mode in the sidebar.\n\nTo use the real model, ensure you have an API key configured and disable Mock Mode.`;
};