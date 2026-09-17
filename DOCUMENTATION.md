# TelePaisa - Telegram Bot User Manual

Welcome to the **TelePaisa** Telegram Bot (`@TelePaisa_Bot`)! This user manual explains how to set up, track expenses, manage monthly budgets, edit/delete transactions, and query your spending insights using Telegram slash commands, persistent keyboards, and natural text messages.

---

## Getting Started

Follow these simple steps to start tracking your expenses:

1. **Open the Bot**: Search for `@TelePaisa_Bot` on Telegram or click the share link (`https://t.me/TelePaisa_Bot`).
2. **Press Start**: Tap the **Start** button or send `/start` to activate the bot and show the persistent keyboard.
3. **Use the Menu or Keyboard**: Use Telegram's `/` popup command menu or tap the bottom persistent keyboard buttons (`💰 Summary`, `🕐 Recent`, `💳 Budget`, `❓ Help`).
4. **Start Adding Expenses**: Type any expense message like `spent 300 on swiggy` or `uber 200` to log your first transaction!

---

## Persistent Keyboard & Telegram Menu

### 1. Telegram Native Command Menu
When typing `/` in Telegram, TelePaisa auto-suggests:
- `/start` — Start the bot & show menu
- `/help` — View help & usage guide
- `/summary` — View spending summary
- `/recent` — View recent transactions
- `/budget` — View monthly budget limits
- `/website` — Open analytics dashboard

### 2. Persistent Reply Keyboard
After sending `/start` or `/help`, TelePaisa attaches a 4-button persistent reply keyboard at the bottom of your chat:
```text
┌───────────────┬───────────────┐
│ 💰 Summary    │ 🕐 Recent      │
├───────────────┼───────────────┤
│ 💳 Budget     │ ❓ Help        │
└───────────────┴───────────────┘
```
Tapping any button triggers the action instantly without needing to type slash commands.

---

## Telegram Commands Reference

| Command | Purpose | Example | Expected Bot Response |
| :--- | :--- | :--- | :--- |
| **`/start`** | Initialize the bot & show keyboard | `/start` | Welcome guide & persistent 4-button reply keyboard |
| **`/help`** | Show commands & usage guide | `/help` | Detailed list of commands & text syntax |
| **`/summary`** | View overall spending summary | `/summary` | Total cumulative spend, category breakdown, and top category |
| **`/summary <category>`** | View spending for specific category | `/summary food` | Total spend for the specified category |
| **`/recent`** | View paginated recent transactions | `/recent` | Paginated list (5 per page) with `[✏️ Edit]`, `[🗑 Delete]`, `[ ◀ Previous ]`, `[ Next ▶ ]` buttons |
| **`/budget`** | View monthly budgets & progress | `/budget` | Monthly budget limits, current spend, progress percentage, and warnings |
| **`/budget <category> <amount>`** | Set or update monthly category budget | `/budget food 5000` | Confirmation message: `✅ Monthly budget set: ₹5000 for food` |
| **`/edit <num> <amount> [category]`** | Edit amount/category of an expense | `/edit 1 50 food` | Confirmation message: `✅ Updated transaction: ₹50 on food` |
| **`/delete <num>`** | Delete an expense by page number | `/delete 1` | Confirmation message: `✅ Deleted transaction: ₹500 on food` |
| **`/website`** | Open web analytics dashboard | `/website` | Inline button `[ 🌐 Open Dashboard ]` linking to web dashboard |

---

## Natural Language Aliases & Messages

You can interact using natural phrases without typing slash commands:

### Natural Command Aliases
- `recent` or `show recent transactions` $\rightarrow$ Triggers `/recent`
- `summary` or `how much did I spend?` $\rightarrow$ Triggers `/summary`
- `budget` or `show my budget` $\rightarrow$ Triggers `/budget`
- `help` $\rightarrow$ Triggers `/help`

### Natural Expense Entry
- `spent 500 on food`
- `spent 50 on pens` (education)
- `bought a notebook for 80` (education)
- `electricity bill 500` (bills)
- `recharged my phone 299` (recharge)
- `uber ride 200` (travel)
- `netflix subscription 500` (subscriptions)

---

## Expense Categories Reference

TelePaisa supports 11 expense categories designed for college students and general personal finance tracking:

| Category | Description & Common Keywords | Examples |
| :--- | :--- | :--- |
| **`education`** | Pens, pencils, notebooks, stationery, books, textbooks, printing, photocopy, exam fees, college fees, course fees, lab fees, project materials, college supplies | `"spent 50 on pens"`, `"bought a notebook for 80"`, `"paid 500 for exam fees"` |
| **`food`** | Swiggy, Zomato, restaurants, cafes, snacks, lunch, dinner, breakfast, coffee | `"lunch 150"`, `"spent 300 on swiggy"` |
| **`travel`** | Uber, Ola, bus, train, metro, auto, flight, rides | `"uber ride 200"`, `"bus ticket 50"` |
| **`shopping`** | Amazon, Flipkart, clothes, shirts, shoes, dresses | `"bought a shirt 800"`, `"amazon purchase 1200"` |
| **`bills`** | Electricity bill, water bill, internet bill, wifi, rent, utility bills | `"electricity bill 500"`, `"water bill 300"` |
| **`entertainment`** | Movies, games, gaming, Steam, concerts, events, cinema | `"movie 250"`, `"concert ticket 1500"` |
| **`health`** | Medicines, pharmacy, doctor, hospital, medical expenses | `"medicine 100"`, `"doctor fee 500"` |
| **`subscriptions`** | Netflix, Spotify, YouTube Premium, Amazon Prime, recurring subs | `"netflix 199"`, `"spotify 119"` |
| **`personal_care`** | Shampoo, soap, toothpaste, skincare, haircut, grooming, cosmetics | `"shampoo 200"`, `"haircut 150"` |
| **`recharge`** | Mobile recharge, phone recharge, data recharge, prepaid recharge | `"recharge 299"`, `"recharged my phone 299"` |
| **`general`** | Fallback for any expense where category cannot be confidently identified | `"misc expense 100"` |

> [!NOTE]
> **Zero-Value Expense Safeguard**:
> Non-numeric messages (such as `"hello"`, `"recent"`, or `"help"`) will **NEVER** create a ₹0 transaction. The system validates that a valid positive number is present before creating any expense document in MongoDB.

---

## Paginated Transaction Management (`/recent`)

### How Pagination Works
- Sending `/recent` displays 5 transactions per page (e.g. `Page 1 of 4`).
- Tapping `[ Next ▶ ]` or `[ ◀ Previous ]` updates the existing message in-place without flooding your chat.
- Each displayed transaction has inline action buttons `[✏️ Edit #1]` and `[🗑 Delete #1]`.

### Editing & Deleting
- **To Delete**: Tap `[🗑 Delete #1]` or type `/delete 1`.
- **To Edit**: Tap `[✏️ Edit #1]` or type `/edit 1 50` / `/edit 1 50 food`.

> [!IMPORTANT]
> **Telegram Message Editing Safety**:
> Editing your original Telegram message in chat will **NOT** modify your stored database transactions. Explicit commands (`/edit`, `/delete`) or inline buttons must be used to modify stored records.

---

## Monthly Budgeting

### How Budgets Work
- Budgets are calculated on a **monthly basis** for each category.
- Setting a budget creates or updates the limit for that category.
- When an expense is recorded in a budgeted category, TelePaisa calculates your total spending for the month against the limit and shows your progress percentage.

### Setting & Viewing Budgets
- **Set**: `/budget food 5000` or `set budget 5000 food`
- **View**: `/budget` or tap `💳 Budget` button.

---

## Realistic Telegram Conversation Examples

### Example 1: Using Persistent Keyboards & Log
```text
User: [Taps 💰 Summary button]
Bot: 📊 Spending Summary:
💰 Total Spent: ₹500

Categories:
• food: ₹300
• travel: ₹200

🏆 Top Category: food (₹300)
```

### Example 2: Paginated Recent History & In-Place Editing
```text
User: /recent
Bot: 🕒 Recent Transactions (Page 1 of 2)

1. ₹500 — food — Sep 17
2. ₹300 — food (swiggy) — Sep 17
3. ₹200 — travel (uber) — Sep 17
4. ₹150 — shopping — Sep 16
5. ₹80 — food — Sep 15

💡 Use /edit <num> <amount> or /delete <num> to manage transactions on this page.
[✏️ Edit #1] [🗑 Delete #1] ... [Next ▶]

User: /edit 1 50 food
Bot: ✅ Updated transaction: ₹50 on food
```

---

## Multi-User Data Isolation Guarantee

Your data is completely private and secure:
- **Chat ID Isolation**: TelePaisa uses your unique Telegram Chat ID to isolate all transaction and budget records.
- **Privacy & Security**: All `/edit`, `/delete`, and pagination operations strictly filter by your Chat ID. No other Telegram user can access, view, edit, or delete your financial data, summaries, or budgets through TelePaisa.
