import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_IMAGE_GEN, MODEL_CHAT, MODEL_TEXT_GEN, SYSTEM_INSTRUCTION_COMIC_SCRIPT, SYSTEM_INSTRUCTION_CHAT, SYSTEM_INSTRUCTION_STORY_SCRIPT } from "../constants";
import { ChatMessage, StripPanel, Resource } from "../types";

// Helper to get a fresh instance to avoid stale keys
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please select an API Key from the menu.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateHeroImage = async (): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE_GEN,
      contents: {
        parts: [
          {
            text: "A wide cinematic comic book cover art titled 'THE AMERICAN CHRONICLE'. The scene is a chaotic but organized collage of symbols representing politics (a gavel), technology (a robot arm), and sports (a ball), blended into a futuristic city skyline. Style: High-end digital comic art, bold outlines, vibrant halftone patterns, dynamic angle.",
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "2K"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Hero generation error:", error);
    throw error;
  }
};

export const generateComicPanelImage = async (description: string): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const prompt = `A single panel editorial cartoon. Style: Modern digital comic, highly vibrant and saturated colors, bold clean black outlines, professional coloring. Scene description: ${description}`;
    
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE_GEN,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Comic generation error:", error);
    // Return null instead of throwing to allow partial loading of strips
    return null;
  }
};

export const generateComicScript = async (category: string): Promise<{ title: string; article: string; imagePrompt: string; resources: Resource[] }> => {
  const ai = getAIClient();
  const prompt = `Generate a single comic panel idea for the category: ${category}. It should be relevant to general modern tropes if no specific news is provided. Return JSON with 'title', 'article', 'imagePrompt', and 'resources'.`;

  const response = await ai.models.generateContent({
    model: MODEL_TEXT_GEN,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_COMIC_SCRIPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          article: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                url: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["name", "url", "description"]
            }
          }
        },
        required: ["title", "article", "imagePrompt", "resources"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No script generated");
  return JSON.parse(text);
};

export const generateStripScript = async (title: string, context: string): Promise<Omit<StripPanel, 'id' | 'isLoading'>[]> => {
  const ai = getAIClient();
  const prompt = `Create a 3-panel comic strip based on the headline: "${title}" and context: "${context}".`;

  const response = await ai.models.generateContent({
    model: MODEL_TEXT_GEN,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_STORY_SCRIPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          panels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                caption: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
              },
              required: ["caption", "imagePrompt"]
            }
          }
        },
        required: ["panels"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No strip script generated");
  const data = JSON.parse(text);
  return data.panels;
};

export const sendChatMessage = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  const ai = getAIClient();
  
  // Transform history to Gemini format
  const chatHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  const chat = ai.chats.create({
    model: MODEL_CHAT,
    history: chatHistory,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_CHAT,
    }
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text || "I'm drawing a blank here...";
};