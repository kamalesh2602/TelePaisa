import assert from "node:assert";
import { detectCategory, CATEGORIES } from "../constants/categories.js";

console.log("🧪 Running TelePaisa Category Detection Test Suite...\n");

const testCases = [
  // Requirement 16 Verification Examples
  { input: "spent 50 on pens", expected: "education" },
  { input: "notebook 100", expected: "education" },
  { input: "lunch 150", expected: "food" },
  { input: "uber 200", expected: "travel" },
  { input: "movie 250", expected: "entertainment" },
  { input: "netflix 199", expected: "subscriptions" },
  { input: "medicine 100", expected: "health" },
  { input: "recharge 299", expected: "recharge" },
  { input: "shampoo 200", expected: "personal_care" },
  { input: "electricity bill 500", expected: "bills" },
  { input: "bought a shirt 800", expected: "shopping" },

  // Requirement 11 & Student/College Expense Examples
  { input: "bought a notebook for 80", expected: "education" },
  { input: "paid 500 for exam fees", expected: "education" },
  { input: "college fees 15000", expected: "education" },
  { input: "stationery 150", expected: "education" },
  { input: "photocopy 20", expected: "education" },
  { input: "spent 200 on lunch", expected: "food" },
  { input: "uber ride 200", expected: "travel" },
  { input: "recharged my phone 299", expected: "recharge" },
  { input: "water bill 300", expected: "bills" },
  { input: "internet bill 999", expected: "bills" },
  { input: "concert 1500", expected: "entertainment" },
  { input: "spotify 119", expected: "subscriptions" },
  { input: "toothpaste 90", expected: "personal_care" },

  // General Fallback Examples
  { input: "something unknown 123", expected: "general" }
];

let passed = 0;
let failed = 0;

for (const { input, expected } of testCases) {
  const result = detectCategory(input);
  try {
    assert.strictEqual(result, expected);
    assert.ok(CATEGORIES.includes(result), `Result "${result}" should be a valid category`);
    console.log(`  ✅ Passed: "${input}" → ${result}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ Failed: "${input}" → Expected "${expected}", got "${result}"`);
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests.`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 All category detection tests passed successfully!");
}
