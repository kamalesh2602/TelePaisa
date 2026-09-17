import { GoogleGenerativeAI } from "@google/generative-ai";
import { CATEGORIES, detectCategory } from "../constants/categories.js";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

export async function parseExpense(text) {

  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
Extract expense details from this message.

Message:
"${text}"

Category MUST be one of the following exact strings:
food, travel, shopping, education, bills, entertainment, health, subscriptions, personal_care, recharge, general.

Return ONLY valid JSON.

Format:
{
  "amount": number,
  "category": string,
  "merchant": string,
  "type": "expense"
}

Examples:
"spent 300 on swiggy"
{
  "amount": 300,
  "category": "food",
  "merchant": "swiggy",
  "type": "expense"
}

"spent 50 on pens"
{
  "amount": 50,
  "category": "education",
  "merchant": "unknown",
  "type": "expense"
}

"amazon prime subscription 500"
{
  "amount": 500,
  "category": "subscriptions",
  "merchant": "amazon prime",
  "type": "expense"
}
`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    const raw = response.text();

    console.log("RAW AI:", raw);

    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {

      const parsed = JSON.parse(cleaned);

      if (parsed && typeof parsed.category === "string") {
        const catLower = parsed.category.toLowerCase().trim();
        if (CATEGORIES.includes(catLower)) {
          parsed.category = catLower;
        } else {
          parsed.category = detectCategory(text);
        }
      } else if (parsed) {
        parsed.category = detectCategory(text);
      }

      return parsed;

    } catch {

      console.log("Invalid AI JSON, fallback used");

      return basicParser(text);
    }

  } catch (err) {

    console.log("AI ERROR:", err.message);

    return basicParser(text);
  }
}

// ---------------- FALLBACK PARSER ----------------

function basicParser(text) {

  const lower = text.toLowerCase();

  const amount = parseInt(
    lower.match(/\d+/)?.[0] || 0
  );

  const category = detectCategory(text);

  return {
    amount,
    category,
    merchant: "unknown",
    type: "expense"
  };
}