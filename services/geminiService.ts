import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ReferencingStyle, PlagiarismResult, ScheduleEvent } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we assume the key is present.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

export const checkPlagiarism = async (text: string): Promise<PlagiarismResult> => {
  try {
    const prompt = `
      Analyze the following text for potential plagiarism. Your response must be in JSON format according to the provided schema.
      1.  Provide a brief overall 'summary' of your findings.
      2.  Calculate a 'plagiarismScore' as a percentage from 0 to 100. This score should represent the proportion of the text that is likely plagiarized.
      3.  Crucially, if a piece of text is copied but has a clear in-text citation (e.g., "(Smith, 2023)" or "[1]"), it should NOT contribute to the plagiarismScore.
      4.  Identify specific sentences or phrases that are highly similar to existing online sources.
      5.  For each identified phrase, provide:
          - 'plagiarizedText': the exact text from the input.
          - 'source': the likely URL of the source.
          - 'confidence': your confidence level ('High', 'Medium', or 'Low').
          - 'status': mark as 'Plagiarized' if there is no citation, or 'Referenced' if a proper in-text citation is present nearby.
      6.  Return an array of these findings under the 'findings' key. If no plagiarism is found, the 'findings' array should be empty and the 'plagiarismScore' should be 0.

      Text to check:
      ---
      ${text}
      ---
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            plagiarismScore: { type: Type.NUMBER },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  plagiarizedText: { type: Type.STRING },
                  source: { type: Type.STRING },
                  confidence: { type: Type.STRING },
                  status: { type: Type.STRING },
                },
                required: ["plagiarizedText", "source", "confidence", "status"],
              },
            },
          },
          required: ["summary", "findings", "plagiarismScore"],
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText);
    
    // Add default plagiarismScore if missing, to prevent crashes
    if (typeof parsedResult.plagiarismScore === 'undefined') {
        parsedResult.plagiarismScore = 0;
    }

    if (parsedResult && Array.isArray(parsedResult.findings)) {
      return parsedResult as PlagiarismResult;
    } else {
        throw new Error("Invalid JSON structure received from API.");
    }

  } catch (error) {
    console.error("Error in checkPlagiarism:", error);
    return {
      summary: "An error occurred while checking for plagiarism. The AI model may have returned an invalid response or the content was blocked. Please try again with different text.",
      findings: [],
      plagiarismScore: 0,
    };
  }
};

export const generateCitation = async (style: ReferencingStyle, sourceType: string, details: string): Promise<string> => {
  try {
    const prompt = `
      Generate a citation in ${style} style for the following source.
      Source Type: ${sourceType}
      Details: ${details}
      
      Provide only the formatted citation.
    `;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error in generateCitation:", error);
    return "An error occurred while generating the citation.";
  }
};

export const generateEssayStructure = async (topic: string, type: 'Essay' | 'Report', wordCount: number): Promise<string> => {
  try {
    const prompt = `
      Create a detailed structure and format for a ${type} of approximately ${wordCount} words on the topic: "${topic}".
      The structure should be appropriately detailed for the given word count.
      Include sections like Introduction, Body Paragraphs (with suggested themes and potential word count allocation), and Conclusion.
      This is for assistance purposes, so provide a clear, actionable outline.
    `;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error in generateEssayStructure:", error);
    return "An error occurred while generating the structure.";
  }
};

export const generateFlashcards = async (subject: string): Promise<{question: string, answer: string}[]> => {
  try {
    const prompt = `Generate 10 flashcards for the subject: "${subject}". Each flashcard should have a question and a concise answer.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
            },
            required: ["question", "answer"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error in generateFlashcards:", error);
    return [];
  }
};

export const explainConcept = async (concept: string, complexity: string): Promise<string> => {
  try {
    const prompt = `
      Explain the following concept or question.
      Target audience/complexity: ${complexity}.
      Concept: "${concept}"

      Provide a clear, concise, and easy-to-understand explanation.
    `;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error in explainConcept:", error);
    return "An error occurred while explaining the concept. Please try again.";
  }
};

export const generateMindfulMoment = async (): Promise<string> => {
  try {
    const prompt = `
      Generate a short, simple, and actionable mindfulness exercise for a stressed student. 
      The exercise should be 1-3 sentences long and easy to do at a desk.
      Focus on calming the mind or gentle body awareness.
      Example: "Close your eyes and take three deep breaths. For each breath, feel the air fill your lungs and then slowly release it. Notice how your body feels."
      Do not include any introductory text like "Here is a mindfulness exercise:". Just provide the exercise itself.
    `;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error in generateMindfulMoment:", error);
    return "Could not generate a mindful moment right now. Please try again later.";
  }
};

// --- New AI Functions ---

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const prompt = `Summarize the following text concisely. Focus on the main points and key takeaways.\n\nText:\n---\n${text}`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error in summarizeText:", error);
    return "An error occurred while summarizing the text.";
  }
};

export const findActionItems = async (text: string): Promise<string> => {
    try {
      const prompt = `Analyze the following text and extract any potential action items, tasks, or deadlines. List them clearly as bullet points. If no action items are found, state that.\n\nText:\n---\n${text}`;
      const response = await ai.models.generateContent({ model, contents: prompt });
      return response.text;
    } catch (error) {
      console.error("Error in findActionItems:", error);
      return "An error occurred while finding action items.";
    }
};

export const improveWriting = async (text: string): Promise<string> => {
    try {
      const prompt = `Review and improve the following text. Correct any spelling and grammar mistakes, and enhance the clarity and flow. Provide only the improved text as the response.\n\nOriginal Text:\n---\n${text}`;
      const response = await ai.models.generateContent({ model, contents: prompt });
      return response.text;
    } catch (error) {
      console.error("Error in improveWriting:", error);
      return "An error occurred while improving the text.";
    }
};

export const answerFromDocument = async (documentText: string, question: string): Promise<string> => {
    try {
        const prompt = `Based *only* on the provided document text, answer the following question. If the answer cannot be found in the document, state that clearly.\n\nDocument Text:\n---\n${documentText}\n---\n\nQuestion: ${question}`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error in answerFromDocument:", error);
        return "An error occurred while processing the document and question.";
    }
};

export const createStudyPlan = async (goal: string, timeframe: string): Promise<Omit<ScheduleEvent, 'id'>[]> => {
    try {
        const prompt = `
            Create a structured study plan for a student.
            Goal: ${goal}
            Timeframe: ${timeframe}
            
            Your response must be a JSON array of objects, where each object represents a study session or task. 
            Do not include any introductory text.
            Each object must have the following properties:
            - "title": A concise description of the study session (e.g., "Review Chapter 3-4").
            - "date": The scheduled date for the session in "YYYY-MM-DDTHH:mm:ss.sssZ" ISO 8601 format. Spread the sessions reasonably over the timeframe. Assume the current date is ${new Date().toISOString()}.
            - "type": The event type, which should be 'other' for all items in the study plan.
        `;
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            date: { type: Type.STRING },
                            type: { type: Type.STRING },
                        },
                        required: ["title", "date", "type"],
                    },
                },
            },
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        // Validate and format dates
        return parsed.map((item: any) => ({...item, date: new Date(item.date)}));
    } catch (error) {
        console.error("Error in createStudyPlan:", error);
        return [];
    }
};