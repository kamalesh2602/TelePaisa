# TelePaisa - Telegram Bot User Manual

Welcome to the **TelePaisa** Telegram Bot (`@TelePaisa_Bot`)! This user manual explains how to set up, track expenses, manage monthly budgets, and query your spending insights using both Telegram slash commands and natural language messages.

---

## Getting Started

Follow these simple steps to start tracking your expenses:

1. **Open the Bot**: Search for `@TelePaisa_Bot` on Telegram or click the share link (`https://t.me/TelePaisa_Bot`).
2. **Press Start**: Tap the **Start** button or send `/start` to receive your welcome message.
3. **View Help**: Send `/help` anytime to inspect the list of available commands and natural language examples.
4. **Start Adding Expenses**: Type any expense message like `spent 300 on swiggy` or `uber 200` to log your first transaction!

---

## Telegram Commands Reference

| Command | Purpose | Example | Expected Bot Response |
| :--- | :--- | :--- | :--- |
| **`/start`** | Initialize the bot & view intro | `/start` | Welcome guide with quick command & text message examples |
| **`/help`** | Show commands & usage guide | `/help` | Detailed list of supported slash commands and text syntax |
| **`/summary`** | View overall spending summary | `/summary` | Total cumulative spend, category breakdown, and top category |
| **`/summary <category>`** | View spending for specific category | `/summary food` | Total spend for the specified category |
| **`/recent`** | View 5 recent transactions | `/recent` | Numbered list of recent expenses with amounts, categories, and dates |
| **`/budget`** | View monthly budgets & progress | `/budget` | Monthly budget limits, current spend, progress percentage, and warnings |
| **`/budget <category> <amount>`** | Set or update monthly category budget | `/budget food 5000` | Confirmation message: `✅ Monthly budget set: ₹5000 for food` |

---

## Adding Expenses

You can record expenses by typing natural language messages. TelePaisa extracts the **amount**, **category**, and **merchant**.

### Natural Language Examples
- `spent 500 on food`
- `spent 300 on swiggy`
- `uber ride 200`
- `netflix subscription 500`
- `spent 1500 on travel`
- `250 for pizza`

### How the Parser Interprets Messages
- **Amount Extraction**: Extracts the numerical value present in the message (e.g., `500`, `300`).
- **Category & Merchant Identification**:
  - `swiggy`, `zomato`, `pizza`, `burger`, `food` $\rightarrow$ **Category**: `food`
  - `uber`, `ola`, `bus`, `train`, `travel` $\rightarrow$ **Category**: `travel`
  - `netflix`, `movie`, `game`, `steam` $\rightarrow$ **Category**: `entertainment`
  - `amazon`, `flipkart`, `shopping` $\rightarrow$ **Category**: `shopping`
  - `amazon prime`, `spotify` $\rightarrow$ **Category**: `subscriptions`
  - `pharmacy`, `apollo` $\rightarrow$ **Category**: `health`
  - Unrecognized items default to category `other` or `general`.

---

## Monthly Budgeting

### How Budgets Work
- Budgets are calculated on a **monthly basis** for each category.
- Setting a budget creates or updates the limit for that category.
- When an expense is recorded in a budgeted category, TelePaisa calculates your total spending for the month against the limit and shows your progress percentage.

### Setting a Budget
- **Command**: `/budget food 5000`
- **Natural Language**: `set budget 5000 food`

### Viewing Budgets
- Send `/budget` to see all set monthly budget limits, total spent so far, percentage consumed, and any limit warnings.

### Budget Alerts
- **Within Limit**: `⚠️ food: ₹350/₹5000 (7.0%)`
- **Limit Exceeded**: `⚠️ food: ₹5200/₹5000 (104.0%)\n🚨 Budget exceeded!`

---

## Spending Summaries & Queries

You can query your spending using slash commands or natural phrases:

### Commands
- `/summary` — Returns overall spending summary and category breakdown.
- `/summary food` — Returns total spending for `food`.
- `/summary travel` — Returns total spending for `travel`.

### Natural Language Queries
- `how much total`
- `how much spent`
- `spending summary`
- `how is my spending`

---

## Supported Categories

- `food`
- `travel`
- `shopping`
- `entertainment`
- `subscriptions`
- `health`
- `general` / `other`

---

## Realistic Telegram Conversation Examples

### Example 1: Welcome & First Expense
```text
User: /start
Bot: 👋 Welcome to your AI Personal Finance Assistant!

Track expenses naturally or use slash commands:

💡 Commands:
• /help - View commands & usage guide
• /summary - View total spending & category breakdown
• /summary <category> - View spending for a specific category
• /recent - View recent transactions
• /budget - View monthly budget limits
• /budget <category> <amount> - Set a monthly budget

💬 Natural Language Examples:
• "spent 300 on swiggy"
• "uber ride 200"

User: spent 300 on swiggy
Bot: ✅ Added ₹300 to food
```

### Example 2: Setting a Budget & Checking Status
```text
User: /budget food 5000
Bot: ✅ Monthly budget set: ₹5000 for food

User: spent 4800 on groceries
Bot: ✅ Added ₹4800 to food
⚠️ food: ₹5100/₹5000 (102.0%)
🚨 Budget exceeded!

User: /budget
Bot: 🎯 Monthly Budgets:

• food: ₹5100 / ₹5000 (102.0%) 🚨 Exceeded!

To set/update a budget:
/budget <category> <amount>
```

### Example 3: Summaries & Recent History
```text
User: /summary
Bot: 📊 Spending Summary:
💰 Total Spent: ₹5300

Categories:
• food: ₹5100
• travel: ₹200

🏆 Top Category: food (₹5100)

User: /recent
Bot: 🕒 Recent Transactions:

1. ₹4800 on food - 17/09/2026
2. ₹300 on food (swiggy) - 17/09/2026
3. ₹200 on travel (uber) - 17/09/2026
```

---

## Multi-User Data Isolation Guarantee

Your data is completely private and secure:
- **Chat ID Isolation**: TelePaisa uses your unique Telegram Chat ID to isolate all transaction and budget records.
- **Privacy Assurance**: No other Telegram user can access, view, or modify your financial data, summaries, or budgets through TelePaisa.
