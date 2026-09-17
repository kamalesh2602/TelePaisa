export const CATEGORIES = [
  "food",
  "travel",
  "shopping",
  "education",
  "bills",
  "entertainment",
  "health",
  "subscriptions",
  "personal_care",
  "recharge",
  "general"
];

/**
 * Rules for detecting category based on keywords and natural language phrases.
 * Order matters: multi-word phrases and specific category rules are evaluated first.
 */
const CATEGORY_RULES = [
  {
    category: "subscriptions",
    pattern: /\b(netflix|spotify|youtube premium|youtube|amazon prime|subscriptions?)\b/i
  },
  {
    category: "education",
    pattern: /\b(pens?|pencils?|notebooks?|stationery|books?|textbooks?|printing|photocopy|xerox|exam fees?|college fees?|course fees?|lab fees?|project materials?|college supplies?|tuition|coaching)\b/i
  },
  {
    category: "bills",
    pattern: /\b(electricity bill|electricity|water bill|water|internet bill|internet|wifi|broadband|rent|utility bills?|utilities|utility)\b/i
  },
  {
    category: "entertainment",
    pattern: /\b(movies?|games?|gaming|steam|events?|concerts?|cinema|theatre)\b/i
  },
  {
    category: "health",
    pattern: /\b(medicines?|pharmacy|doctor|hospital|medical expenses?|medical|apollo)\b/i
  },
  {
    category: "personal_care",
    pattern: /\b(shampoo|soap|toothpaste|skincare|haircut|grooming|cosmetics)\b/i
  },
  {
    category: "recharge",
    pattern: /\b(mobile recharge|phone recharge|data recharge|prepaid recharge|recharges?|recharged)\b/i
  },
  {
    category: "food",
    pattern: /\b(swiggy|zomato|pizza|burger|lunch|dinner|breakfast|food|cafe|restaurant|snacks?|tea|coffee)\b/i
  },
  {
    category: "travel",
    pattern: /\b(uber|ola|bus|train|cab|auto|flight|metro|ride|travel)\b/i
  },
  {
    category: "shopping",
    pattern: /\b(amazon|flipkart|shirt|clothes|shopping|dress|shoes)\b/i
  }
];

/**
 * Detects the category of an expense from natural language input text.
 * @param {string} text - User message input
 * @returns {string} - Matching category or "general"
 */
export function detectCategory(text) {
  if (!text || typeof text !== "string") {
    return "general";
  }

  const cleanText = text.trim();

  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(cleanText)) {
      return rule.category;
    }
  }

  return "general";
}
