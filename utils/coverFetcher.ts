/**
 * Fetches a book cover image URL from the Open Library API.
 * This is a free public API and does not require an API key.
 * @param title The title of the book.
 * @param author The author of the book.
 * @returns A promise that resolves to an image URL string, or null if not found or an error occurs.
 */
export const getCoverForBook = async (title: string, author: string): Promise<string | null> => {
    // Construct a query optimized for finding book covers.
    const authorQuery = author !== 'Unknown Author' ? author : '';
    const searchQuery = `${title} ${authorQuery}`.trim();

    const url = new URL('https://openlibrary.org/search.json');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('limit', '1'); // We only need the top result.

    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            console.error(`Open Library API error: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
            const book = data.docs[0];
            if (book.cover_i) {
                // Construct the URL for the large version of the cover.
                const imageUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
                return imageUrl;
            }
        }

        console.warn(`No cover image found via Open Library for query: "${searchQuery}"`);
        return null;

    } catch (error) {
        console.error("An error occurred during Open Library API request:", error);
        return null;
    }
};
