
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
    return {
        inlineData: {
            data: base64Data,
            mimeType,
        },
    };
};

export const generateCaption = async (base64Image: string, mimeType: string): Promise<string> => {
    if (!API_KEY) {
        return "API key not configured. This is a default caption.";
    }
    try {
        const imagePart = fileToGenerativePart(base64Image, mimeType);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: "Describe this image in a single, descriptive sentence." }, imagePart] },
        });

        const text = response.text;
        return text.trim();
    } catch (error) {
        console.error("Error generating caption:", error);
        throw new Error("Failed to generate caption from AI.");
    }
};
