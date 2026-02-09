import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

async function listModels() {
  try {
    const result = await genAI.listModels();
    console.log("Available models:");
    result.models.forEach((m) => {
      console.log(`${m.name} - ${m.supportedGenerationMethods}`);
    });
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
