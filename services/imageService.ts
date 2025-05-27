
import { GoogleGenAI, GenerateImagesResponse } from "@google/genai";
import { IMAGEN_MODEL_NAME } from '../constants';

export const generateImageFromPrompt = async (ai: GoogleGenAI, prompt: string): Promise<string> => {
  try {
    const response: GenerateImagesResponse = await ai.models.generateImages({
      model: IMAGEN_MODEL_NAME,
      prompt: prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }, 
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image generated or unexpected response format.");
    }
  } catch (error) {
    console.error("Imagen API error in generateImageFromPrompt:", error);
    // Re-throw or handle more gracefully
    throw error;
  }
};
