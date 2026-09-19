import { GoogleGenerativeAI } from "@google/generative-ai";
import { CATEGORIES, detectCategory } from "../constants/categories.js";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

export async function parseExpense(text, customCategories = []) {

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
        const matchedCustom = customCategories.find(c => {
          const name = (typeof c === "string" ? c : c.name || "").toLowerCase();
          const slug = (typeof c === "string" ? c : c.slug || "").toLowerCase();
          return name === catLower || slug === catLower;
        });

        if (CATEGORIES.includes(catLower)) {
          parsed.category = catLower;
        } else if (matchedCustom) {
          parsed.category = typeof matchedCustom === "string" ? matchedCustom : (matchedCustom.name || matchedCustom.slug);
        } else {
          parsed.category = detectCategory(text, customCategories);
        }
      } else if (parsed) {
        parsed.category = detectCategory(text, customCategories);
      }

      return parsed;

    } catch {

      console.log("Invalid AI JSON, fallback used");

      return basicParser(text, customCategories);
    }

  } catch (err) {

    console.log("AI ERROR:", err.message);

    return basicParser(text, customCategories);
  }
}

// ---------------- FALLBACK PARSER ----------------

function basicParser(text, customCategories = []) {

  const lower = text.toLowerCase();

  const amount = parseInt(
    lower.match(/\d+/)?.[0] || 0
  );

  const category = detectCategory(text, customCategories);

  return {
    amount,
    category,
    merchant: "unknown",
    type: "expense"
  };
}