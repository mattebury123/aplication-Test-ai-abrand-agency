
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { BrandConcept } from "../types";

// Helper to get the client instance with the current key
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a key first.");
  }
  return new GoogleGenAI({ apiKey });
};

export const checkApiKey = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  return false;
};

export const requestApiKey = async (): Promise<void> => {
  if (typeof window !== 'undefined' && window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  } else {
    console.warn("AI Studio API Key selection not available in this environment.");
  }
};

const conceptSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Creative name for this specific brand direction (e.g. 'Neon Future', 'Clean Slate')" },
    summary: { type: Type.STRING, description: "One sentence summary of this strategic direction." },
    logoConcept: { type: Type.STRING, description: "Detailed text description of the visual logo." },
    typography: { type: Type.STRING, description: "Specific font recommendations and hierarchy." },
    colorPalette: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          hex: { type: Type.STRING },
          usage: { type: Type.STRING }
        },
        required: ["name", "hex", "usage"]
      }
    },
    moodBoard: { type: Type.STRING, description: "A descriptive list of visual themes, textures, and feelings." },
    brandVoice: {
      type: Type.OBJECT,
      properties: {
        tone: { type: Type.STRING },
        dos: { type: Type.ARRAY, items: { type: Type.STRING } },
        donts: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["tone", "dos", "donts"]
    },
    missionVision: {
      type: Type.OBJECT,
      properties: {
        mission: { type: Type.STRING },
        vision: { type: Type.STRING }
      },
      required: ["mission", "vision"]
    },
    taglines: { type: Type.ARRAY, items: { type: Type.STRING } },
    socialStrategy: { type: Type.STRING, description: "Brief social media strategy for this direction." },
    campaigns: {
      type: Type.ARRAY,
      description: "3 specific social media post ideas to launch this brand.",
      items: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING, description: "e.g. Instagram, LinkedIn, TikTok" },
          caption: { type: Type.STRING, description: "The caption text for the post." },
          imagePrompt: { type: Type.STRING, description: "A detailed AI image prompt to generate the visual for this post." }
        },
        required: ["platform", "caption", "imagePrompt"]
      }
    }
  },
  required: [
    "name", "summary", "logoConcept", "typography", "colorPalette", 
    "moodBoard", "brandVoice", "missionVision", "taglines", "socialStrategy", "campaigns"
  ]
};

const brandPackageSchema = {
  type: Type.OBJECT,
  properties: {
    concepts: {
      type: Type.ARRAY,
      items: conceptSchema,
      description: "Exactly 1 distinct brand concept."
    }
  },
  required: ["concepts"]
};

// Helper function to extract JSON from a potential markdown response
const extractJson = (text: string): string => {
  let cleaned = text;

  // 1. Remove markdown code blocks
  cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '');
  
  // 2. Remove comments SAFELY.
  // Only remove lines that strictly start with optional whitespace and //
  // This preserves URLs like https:// which contain //
  cleaned = cleaned.replace(/^[ \t]*\/\/.*$/gm, '');

  // 3. Remove Trailing Commas (safely)
  // Replaces ", }" or ", ]" with "}" or "]"
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  // 4. Find the outer-most brackets to ignore preamble text
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    return cleaned.substring(firstOpen, lastClose + 1);
  }
  
  return cleaned.trim();
};

export const generateBrandConcepts = async (
  companyName: string, 
  description: string,
  businessType: string,
  brandStyle: string,
  websiteUrl?: string
): Promise<BrandConcept[]> => {
  const ai = getAiClient();
  
  const prompt = `
    Act as a world-class AI Brand Agency. Develop a comprehensive brand identity package for:
    
    Company Name: ${companyName}
    Business Type: ${businessType}
    Desired Brand Style: ${brandStyle}
    Description: ${description}
    ${websiteUrl ? `Website URL for context: ${websiteUrl}` : ''}
    
    Task: Create exactly 1 DISTINCT and UNIQUE brand concept (direction) for this company.
    The concept should be a "High-Quality/Premium" choice.
    
    Ensure the concept has a unique logo, color palette, voice, and a 3-post social media launch campaign.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: brandPackageSchema,
        systemInstruction: "Output pure JSON only. Do not use comments. Escape all special characters and newlines within strings."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    const cleanedText = extractJson(text);
    
    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (e) {
      console.error("JSON Parse Error. Raw text:", text);
      console.error("Cleaned text:", cleanedText);
      // Fallback: Try a simpler parse if cleaning failed, or look for partial json
      try {
          // If regex failed, try aggressive search
          const start = text.indexOf('{');
          const end = text.lastIndexOf('}');
          if (start >= 0 && end > start) {
              const substring = text.substring(start, end + 1);
              // Remove trailing commas manually in substring if regex failed
              const cleanSub = substring.replace(/,(\s*[}\]])/g, '$1');
              parsed = JSON.parse(cleanSub);
          } else {
              throw new Error("No JSON object found.");
          }
      } catch (e2) {
        throw new Error("Failed to parse AI response. The model returned invalid JSON.");
      }
    }
    
    // VALIDATION
    if (!parsed || !parsed.concepts || !Array.isArray(parsed.concepts)) {
      console.error("Invalid Structure:", parsed);
      throw new Error("AI response missing concepts array.");
    }
    
    // Add IDs to concepts
    return parsed.concepts.map((c: any, index: number) => ({
      ...c,
      id: `concept-${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error("Error in generateBrandConcepts:", error);
    throw error;
  }
};

// Helper for timeout
const timeoutPromise = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Request timed out")), ms);
    promise.then(
      (res) => { clearTimeout(timer); resolve(res); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
};

export const generateBrandImage = async (
  prompt: string, 
  size: '1K' | '2K' | '4K' = '1K',
  aspectRatio: '1:1' | '16:9' | '9:16' = '1:1',
  referenceImageUrl?: string
): Promise<string> => {
  const ai = getAiClient();

  const parts: any[] = [];
  
  // If we have a reference image (e.g., the logo), add it first
  if (referenceImageUrl && !referenceImageUrl.startsWith('error')) {
    try {
      // Clean base64 string
      const base64Data = referenceImageUrl.split(',')[1] || referenceImageUrl;
      
      // Ensure it's not empty and looks vaguely like base64
      if (base64Data && base64Data.length > 100) {
        parts.push({
          inlineData: {
            mimeType: 'image/png', 
            data: base64Data
          }
        });
      }
    } catch (e) {
      console.warn("Failed to process reference image, proceeding without it.");
    }
  }

  // Add the text prompt
  parts.push({ text: prompt });

  const runRequest = async (model: string, useConfig: boolean) => {
      const requestOptions: any = {
          model: model,
          contents: { parts: parts },
      };
      
      if (useConfig) {
          requestOptions.config = {
              imageConfig: {
                  imageSize: size,
                  aspectRatio: aspectRatio
              }
          };
      }
      
      return await timeoutPromise<GenerateContentResponse>(
          ai.models.generateContent(requestOptions),
          60000 // 60s timeout
      );
  };

  try {
    // Attempt 1: Gemini 3 Pro Image Preview (High Quality)
    // This model might fail if quota is exceeded (429) or not enabled
    const response = await runRequest("gemini-3-pro-image-preview", true);
    return extractImageFromResponse(response);

  } catch (error: any) {
    const errString = String(error);

    // CHECK FOR QUOTA / PERMISSION ERRORS (429 / 403)
    // If Pro model fails, fallback to standard Flash model
    if (
        errString.includes("429") || 
        errString.includes("RESOURCE_EXHAUSTED") ||
        errString.includes("403") ||
        errString.includes("PERMISSION_DENIED")
    ) {
        console.warn("Gemini 3 Pro quota exceeded or denied. Falling back to Gemini 2.5 Flash Image.");
        
        try {
            // Attempt 2: Fallback to Gemini 2.5 Flash Image
            // Note: 2.5 Flash Image does not support 'imageConfig' for size/ratio.
            // We append aspect ratio to the prompt as a hint.
            parts.push({ text: ` Aspect ratio ${aspectRatio.replace(':', ' to ')}.` });
            
            const fallbackResponse = await runRequest("gemini-2.5-flash-image", false);
            return extractImageFromResponse(fallbackResponse);
        } catch (fallbackError) {
             console.error("Fallback image generation failed:", fallbackError);
             // Return original error to helpful debugging if both fail
             throw error; 
        }
    }

    console.error("Image generation failed:", error);
    throw error;
  }
};

const extractImageFromResponse = (response: GenerateContentResponse): string => {
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Check if we got text explaining why image failed (e.g. safety)
    const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
    if (textPart) {
        console.warn("Model returned text instead of image:", textPart.text);
        throw new Error(`Model returned text: ${textPart.text.substring(0, 50)}...`);
    }

    throw new Error("No image data found in response");
};
