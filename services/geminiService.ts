import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Summarize the following text for a student. Focus on key concepts, definitions, and main ideas. Present the output as a list. Text: "${text}"`,
       config: {
        systemInstruction: "You are an expert academic assistant that creates concise and clear summaries."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    return "Failed to summarize text. Please check the console for details.";
  }
};

export const generateFlashcards = async (topic: string): Promise<Flashcard[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 high-quality flashcards (question and answer) for the topic: "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: 'The question for the flashcard front.'
              },
              answer: {
                type: Type.STRING,
                description: 'The answer for the flashcard back.'
              }
            },
            required: ["question", "answer"],
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const flashcards: Flashcard[] = JSON.parse(jsonText);
    return flashcards;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
  }
};


export const explainConcept = async (concept: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Explain the following concept to a high school student in a simple, easy-to-understand way. Use analogies if possible. Concept: "${concept}"`,
      config: {
        systemInstruction: "You are a friendly and knowledgeable teacher who excels at simplifying complex topics."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error explaining concept:", error);
    return "Failed to explain the concept. Please check the console for details.";
  }
};

export const generateCitation = async (style: string, sourceType: string, details: Record<string, string>): Promise<string> => {
  const detailsString = Object.entries(details)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a citation for the following source. Provide only the fully formatted citation string as a plain text response, without any extra explanations, labels, or markdown.
      - Citation Style: ${style}
      - Source Type: ${sourceType}
      - Details: ${detailsString}`,
      config: {
        systemInstruction: "You are an expert academic librarian specializing in citation formats. Your task is to generate a perfectly formatted citation based on the user's request. Output only the final citation string.",
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error generating citation:', error);
    return 'Failed to generate citation. Please check the console for details.';
  }
};

export const generateThesis = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 3 distinct and strong thesis statement options for an essay on the following topic: "${topic}". Present them as a numbered list.`,
      config: {
        systemInstruction: "You are an expert writing tutor that helps students craft compelling thesis statements."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating thesis:", error);
    return "Failed to generate thesis statements. Please try again.";
  }
};

export const generateOutline = async (topic: string, thesis: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a detailed 5-point essay outline based on the following topic and thesis statement. The outline should include a brief introduction, three body paragraphs with supporting points, and a conclusion.
      - Topic: ${topic}
      - Thesis: ${thesis}
      
      Present the output as a structured, nested list.`,
            config: {
                systemInstruction: "You are an expert academic planner who creates logical and well-structured essay outlines."
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating outline:", error);
        return "Failed to generate an outline. Please try again.";
    }
};

export const expandPoint = async (point: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Expand the following point into a detailed and well-structured paragraph for an academic essay: "${point}"`,
            config: {
                systemInstruction: "You are a skilled academic writer, adept at elaborating on ideas to create insightful paragraphs."
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error expanding point:", error);
        return "Failed to expand the point. Please try again.";
    }
};

export const proofreadText = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Proofread the following text. Correct any grammar, spelling, and punctuation mistakes directly within the text. For stylistic improvements (e.g., clarity, conciseness, word choice), provide a brief explanation. 
      Return the response as a single block of HTML. Use <strong> tags to highlight the direct corrections you made. Use <em> tags for your stylistic suggestions and their explanations. Do not wrap the whole response in a code block.
      Text: "${text}"`,
            config: {
                systemInstruction: "You are a meticulous editor and proofreader. You correct errors and provide helpful, clear suggestions to improve the quality of writing."
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error proofreading text:", error);
        return "Failed to proofread the text. Please try again.";
    }
};

export const requestNewCategory = async (categoryName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `A student has requested a new forum category for "${categoryName}". Please write a short, friendly confirmation message acknowledging that the request has been received and will be reviewed by the community moderators. Do not add the category, just confirm the request.`,
       config: {
        systemInstruction: "You are a helpful community manager for an online student platform."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error requesting new category:", error);
    return "Failed to process your request. Please try again later.";
  }
};
