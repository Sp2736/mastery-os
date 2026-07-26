import fs from 'fs';
import path from 'path';

export interface Quote {
  text: string;
  author: string;
  category: string;
}

export function getDailyQuote(): Quote {
  const filePath = path.join(process.cwd(), 'data', 'quotes', 'quotes.json');
  let quotes: Quote[] = [];

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    quotes = data.quotes || [];
  } catch (error) {
    console.error('Failed to read quotes.json:', error);
    // Fallback quote
    return {
      text: "Discipline equals freedom.",
      author: "Jocko Willink",
      category: "discipline"
    };
  }

  if (quotes.length === 0) {
    return {
      text: "Discipline equals freedom.",
      author: "Jocko Willink",
      category: "discipline"
    };
  }

  // Use the current date to create a deterministic hash
  const today = new Date();
  const dateString = `${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDate()}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % quotes.length;
  
  return quotes[index];
}
