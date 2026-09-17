import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🧪 Running TelePaisa Server-Served Dashboard & Command Test Suite...\n");

// 1. Verify dashboard HTML, CSS, JS files exist
const htmlPath = path.join(__dirname, "..", "public", "dashboard", "index.html");
const cssPath = path.join(__dirname, "..", "public", "dashboard", "style.css");
const jsPath = path.join(__dirname, "..", "public", "dashboard", "script.js");

assert.ok(fs.existsSync(htmlPath), "index.html must exist in public/dashboard/");
assert.ok(fs.existsSync(cssPath), "style.css must exist in public/dashboard/");
assert.ok(fs.existsSync(jsPath), "script.js must exist in public/dashboard/");
console.log("  ✅ public/dashboard/ index.html, style.css, script.js exist.");

// 2. Verify HTML includes Chart.js CDN, sections, and rupees symbol
const htmlContent = fs.readFileSync(htmlPath, "utf-8");
assert.ok(htmlContent.includes("Chart.js") || htmlContent.includes("chart.js"), "HTML should load Chart.js");
assert.ok(htmlContent.includes("Category Breakdown"), "HTML should have Category Breakdown section");
assert.ok(htmlContent.includes("Monthly Spending Trend"), "HTML should have Trend section");
assert.ok(htmlContent.includes("Monthly Budget Progress"), "HTML should have Budget section");
assert.ok(htmlContent.includes("Recent Transactions"), "HTML should have Recent Transactions section");
assert.ok(htmlContent.includes("₹"), "HTML should use Rupee symbol");
console.log("  ✅ index.html structure & Chart.js inclusion verified.");

// 3. Verify script.js handles all 11 categories and fetch APIs
const jsContent = fs.readFileSync(jsPath, "utf-8");
const categories = [
  "food", "travel", "shopping", "education", "bills",
  "entertainment", "health", "subscriptions", "personal_care", "recharge", "general"
];
for (const cat of categories) {
  assert.ok(jsContent.includes(cat), `script.js should contain category: ${cat}`);
}
assert.ok(jsContent.includes("/api/summary"), "script.js should call /api/summary");
assert.ok(jsContent.includes("/api/trend"), "script.js should call /api/trend");
assert.ok(jsContent.includes("/api/budgets"), "script.js should call /api/budgets");
assert.ok(jsContent.includes("/api/recent"), "script.js should call /api/recent");
console.log("  ✅ script.js handles all 11 categories & API endpoints.");

// 4. Verify server.js contains GET /dashboard route and /website command
const serverPath = path.join(__dirname, "..", "server.js");
const serverContent = fs.readFileSync(serverPath, "utf-8");
assert.ok(serverContent.includes('app.get("/dashboard"'), "server.js must define GET /dashboard route");
assert.ok(serverContent.includes('express.static'), "server.js must use express.static");
assert.ok(serverContent.includes('/website'), "server.js must handle /website command");
assert.ok(serverContent.includes('DASHBOARD_URL'), "server.js should use DASHBOARD_URL environment variable");
console.log("  ✅ server.js GET /dashboard route and /website command verified.");

// 5. Verify Contribute section & GitHub links
assert.ok(htmlContent.includes("Contribute to TelePaisa"), "HTML should have Contribute section title");
assert.ok(htmlContent.includes("https://github.com/kamalesh2602/whatsapp-ai-finance-bot/issues"), "Report Issue link must be correct");
assert.ok(htmlContent.includes("https://github.com/kamalesh2602/whatsapp-ai-finance-bot/issues/new?template=feature_request.md"), "Feature Request link must be correct");
assert.ok(htmlContent.includes('target="_blank"'), "Contribution links must open in new tab");
console.log("  ✅ Contribute section & GitHub URLs verified.");

console.log("\n🎉 All Dashboard Integration tests passed successfully!");
