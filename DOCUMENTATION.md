# TelePaisa - Telegram Bot User Manual

Welcome to the **TelePaisa** Telegram Bot (`@TelePaisa_Bot`)! This user manual explains how to set up, track expenses, manage monthly budgets, edit/delete transactions, and query your spending insights using both Telegram slash commands and natural language messages.

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
| **`/recent`** | View 5 recent transactions with buttons | `/recent` | Numbered list of recent expenses with `[✏️ Edit]` & `[🗑 Delete]` buttons |
| **`/budget`** | View monthly budgets & progress | `/budget` | Monthly budget limits, current spend, progress percentage, and warnings |
| **`/budget <category> <amount>`** | Set or update monthly category budget | `/budget food 5000` | Confirmation message: `✅ Monthly budget set: ₹5000 for food` |
| **`/edit <num> <amount> [category]`** | Edit amount and/or category of an expense | `/edit 1 50 food` | Confirmation message: `✅ Updated transaction: ₹50 on food` |
| **`/delete <num>`** | Delete an expense by recent number | `/delete 1` | Confirmation message: `✅ Deleted transaction: ₹500 on food` |

---

## Transaction Correction & Management

### How Transaction Management Works
- Running `/recent` lists your 5 most recent transactions numbered `1`, `2`, `3`, `4`, `5`.
- Each transaction in `/recent` also includes inline buttons: `[✏️ Edit #1]` and `[🗑 Delete #1]`.
- To **Delete**: Type `/delete 1` or tap `[🗑 Delete #1]`.
- To **Edit**: Type `/edit 1 50` (to change amount to ₹50) or `/edit 1 50 food` (to change amount to ₹50 and category to `food`), or tap `[✏️ Edit #1]`.

> [!IMPORTANT]
> **Telegram Message Editing Safety**:
> Editing your original Telegram message (e.g. changing `"spent 500 on food"` to `"spent 50 on food"`) will **NOT** modify your stored database transactions. Explicit commands (`/edit`, `/delete`) or inline buttons are required to prevent accidental database mutations.

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

### Example 1: Logging & Recent History
```text
User: spent 500 on food
Bot: ✅ Added ₹500 to food

User: /recent
Bot: 🕒 Recent Transactions:

1. ₹500 on food - 17/09/2026

💡 Use /edit <num> <amount> or /delete <num> to manage transactions.
[✏️ Edit #1] [🗑 Delete #1]
```

### Example 2: Editing a Transaction
```text
User: /edit 1 50 food
Bot: ✅ Updated transaction: ₹50 on food

User: /summary
Bot: 📊 Spending Summary:
💰 Total Spent: ₹50

Categories:
• food: ₹50

🏆 Top Category: food (₹50)
```

### Example 3: Deleting a Transaction
```text
User: /delete 1
Bot: ✅ Deleted transaction: ₹50 on food

User: /recent
Bot: No recent transactions found.
```

---

## Multi-User Data Isolation Guarantee

Your data is completely private and secure:
- **Chat ID Isolation**: TelePaisa uses your unique Telegram Chat ID to isolate all transaction and budget records.
- **Privacy & Security**: All `/edit` and `/delete` operations strictly filter by your Chat ID. No other Telegram user can access, view, edit, or delete your financial data, summaries, or budgets through TelePaisa.
