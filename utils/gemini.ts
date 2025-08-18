import { GoogleGenAI } from "@google/genai";

const GENRES = ['Sci-Fi', 'Fantasy', 'Mystery', 'Non-Fiction', 'Thriller', 'Biography'];

/**
 * Gets a genre classification for a given audiobook title using the Gemini API.
 * @param title The title of the audiobook.
 * @returns A promise that resolves to a genre string.
 */
export const getGenreForTitle = async (title: string): Promise<string> => {
  // A basic title cleanup to improve API results.
  const cleanTitle = title
    .replace(/\.(m4b|mp3|wav|aac|ogg)$/i, '') // remove extension
    .replace(/[\(\[]?audiobook[\)\]]?/i, '') // remove "(audiobook)"
    .replace(/_/g, ' ') // replace underscores
    .trim();

  try {
    if (!process.env.API_KEY) {
      console.warn("API_KEY environment variable not set. Skipping genre detection.");
      return 'Non-Fiction';
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following audiobook title and determine its genre. Title: "${cleanTitle}". Please choose the single most fitting genre from this list: ${GENRES.join(', ')}. Respond with only the genre name.`,
    });

    const genre = response.text.trim();
    
    // Validate the response from the API
    if (GENRES.some(g => genre.toLowerCase() === g.toLowerCase())) {
        // Find the correct case-sensitive genre name to return
        return GENRES.find(g => genre.toLowerCase() === g.toLowerCase()) || 'Non-Fiction';
    }

    console.warn(`Received unexpected genre "${genre}" from API. Falling back.`);
    return 'Non-Fiction'; // Fallback genre if the response is not in our list
  } catch (error) {
    console.error("Error fetching genre from Gemini API:", error);
    return 'Non-Fiction'; // Fallback genre on error
  }
};
