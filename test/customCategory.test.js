import assert from "node:assert";
import { detectCategory, CATEGORIES } from "../constants/categories.js";

console.log("🧪 Running TelePaisa Custom Category Test Suite...\n");

// 1. Verify Built-in Categories remain unchanged
assert.strictEqual(CATEGORIES.length, 11, "CATEGORIES should contain exactly 11 built-in categories");
assert.ok(CATEGORIES.includes("food"), "CATEGORIES must include 'food'");
assert.ok(CATEGORIES.includes("general"), "CATEGORIES must include 'general'");
console.log("  ✅ Default categories in constants/categories.js are unchanged.");

// 2. Custom category detection tests
const customCategories = [
  { name: "Gym", slug: "gym" },
  { name: "Personal Fitness", slug: "personal_fitness" }
];

const testCases = [
  { input: "spent 500 on gym", expected: "Gym" },
  { input: "gym 1200", expected: "Gym" },
  { input: "paid 2000 for personal fitness", expected: "Personal Fitness" },
  { input: "spent 200 on lunch", expected: "food" },
  { input: "unknown expense 500", expected: "general" }
];

let passed = 0;
let failed = 0;

for (const { input, expected } of testCases) {
  const result = detectCategory(input, customCategories);
  try {
    assert.strictEqual(result, expected);
    console.log(`  ✅ Passed: "${input}" → ${result}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ Failed: "${input}" → Expected "${expected}", got "${result}"`);
    failed++;
  }
}

console.log(`\n📊 Custom Category Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests.`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 All custom category tests passed successfully!");
}
