# TelePaisa - Telegram Bot User Manual

TelePaisa is a Telegram-based personal finance assistant for recording, managing, and reviewing daily expenses and budgets.

This guide explains how to use TelePaisa through Telegram.

---

## Getting Started

1. Open Telegram.
2. Search for **TelePaisa** or open the bot directly:
   **https://t.me/TelePaisa_Bot**
3. Start the bot using `/start`.
4. Use the Telegram menu or send commands/messages directly.

TelePaisa identifies each user using their Telegram Chat ID and keeps finance operations scoped to that user.

---

## Persistent Keyboard & Telegram Menu

After starting the bot, TelePaisa provides a convenient Telegram interface for common actions.

The Telegram command menu includes:

- `/start` - Start or restart the bot
- `/help` - Show available commands
- `/website` - Open the TelePaisa analytics dashboard
- `/summary` - View spending summary
- `/recent` - View recent transactions
- `/budget` - View budget information
- `/edit` - Edit a transaction
- `/delete` - Delete a transaction

You can also send natural-language messages for supported finance actions.

---

## Commands Reference

### `/start`

Initializes the bot and displays the available functionality.

Example:

```text
/start
```

---

### `/help`

Displays the available commands and usage information.

Example:

```text
/help
```

---

### `/website`

Opens the TelePaisa analytics dashboard.

The dashboard provides:

- Total spending
- Category breakdown
- Spending trends
- Budget information
- Recent transactions

Example:

```text
/website
```

---

### `/summary`

Displays a summary of recorded expenses.

Example:

```text
/summary
```

---

### `/recent`

Displays recent transactions.

Example:

```text
/recent
```

Transactions are presented in a paginated format when required.

---

### `/budget`

Displays available budget information.

Example:

```text
/budget
```

---

### `/edit`

Allows you to select and edit an existing transaction.

Example:

```text
/edit
```

TelePaisa presents available transactions and guides you through the editing process.

---

### `/delete`

Allows you to select and delete an existing transaction.

Example:

```text
/delete
```

Deletion is performed on the selected transaction.

---

## Recording Expenses

Expenses can be entered using natural-language messages.

Examples:

```text
Spent 250 on food
```

```text
Bought groceries for 850
```

```text
Paid 1200 for electricity
```

```text
Travel expense 500
```

TelePaisa extracts the expense amount and determines the appropriate category from the message.

---

## Natural-Language Aliases

TelePaisa supports natural-language variations for several common actions.

For example, dashboard-related requests can use terms such as:

```text
website
dashboard
analytics
open dashboard
```

These are interpreted as the dashboard action.

Similarly, supported expense messages can be written naturally instead of following a strict command format.

---

## Expense Categories

TelePaisa organizes expenses into the following categories:

| Category | Example |
|---|---|
| Education | Books, courses, college expenses |
| Food | Meals, groceries, restaurants |
| Travel | Bus, train, cab, fuel |
| Shopping | Clothes, accessories, purchases |
| Bills | Electricity, water, internet |
| Entertainment | Movies, games, outings |
| Health | Medical and healthcare expenses |
| Subscriptions | Online services and memberships |
| Personal Care | Grooming and personal-care expenses |
| Recharge | Mobile and other recharge expenses |
| General | Expenses that do not fit another category |

---

## Zero-Value Expense Safeguard

TelePaisa prevents invalid zero-value expenses from being recorded.

For example:

```text
Spent 0 on food
```

is not treated as a valid expense transaction.

This helps prevent accidental or malformed expense entries from affecting financial records.

---

## Transaction Management

TelePaisa supports viewing, editing, and deleting transactions.

### Viewing Transactions

Use:

```text
/recent
```

to view recent transactions.

When there are many transactions, they are displayed using pagination so that the Telegram conversation remains manageable.

### Editing a Transaction

Use:

```text
/edit
```

Select the transaction you want to modify and follow the prompts.

### Deleting a Transaction

Use:

```text
/delete
```

Select the transaction you want to remove.

These operations are scoped to the current Telegram user.

---

## Telegram Message Editing Safety

TelePaisa uses Telegram message editing for interactive flows where appropriate.

If a message can no longer be edited, the bot handles the situation without treating the message-edit failure as a finance operation failure.

This keeps interactive transaction management reliable while avoiding unnecessary duplicate messages.

---

## Budgeting

TelePaisa supports budget management for expense categories.

Budget-related actions can be performed through the bot's budget functionality.

Example:

```text
/budget
```

A budget can also be provided using a natural-language message when the supported format is recognized.

Example:

```text
set budget 5000 food
```

Budget information can also be viewed from the analytics dashboard.

> **Note:** Budget display and expense aggregation depend on the current server-side implementation. The bot should be treated as the source of truth for supported budget operations.

---

## Analytics Dashboard

TelePaisa includes a web-based analytics dashboard that can be opened directly from Telegram.

Use:

```text
/website
```

and select **Open Dashboard**.

The dashboard provides:

### Total Spending

Shows the total recorded spending for the current user.

### Category Breakdown

Shows spending grouped by expense category.

### Spending Trend

Displays spending trends over time.

### Budgets

Displays available budget information.

### Recent Transactions

Shows recent expense records.

The dashboard is served by the same Express application as the Telegram bot.

---

## Example Telegram Conversations

### Recording an Expense

**User**

```text
Spent 300 on dinner
```

**TelePaisa**

```text
Expense recorded successfully.
Amount: ₹300
Category: Food
```

---

### Viewing Recent Transactions

**User**

```text
/recent
```

**TelePaisa**

```text
Recent Transactions
...
```

The user can navigate through the available pages when multiple transactions exist.

---

### Opening the Dashboard

**User**

```text
/website
```

**TelePaisa**

```text
📊 Open your TelePaisa analytics dashboard
```

The user can select the **Open Dashboard** button to view their analytics.

---

### Managing a Budget

**User**

```text
/budget
```

**TelePaisa**

```text
Budget information
...
```

---

## Data Isolation & Privacy

TelePaisa scopes expense and budget operations using the user's Telegram Chat ID.

Transaction and budget operations are performed for the current user's Chat ID, preventing normal bot interactions from operating on another user's records.

The analytics dashboard also accepts the user's Telegram identifier to retrieve the corresponding finance data.

---

## Tips for Using TelePaisa

- Include the **amount** when recording an expense.
- Mention what the expense was for so TelePaisa can determine the category.
- Use `/recent` to review recorded transactions.
- Use `/edit` when an expense needs correction.
- Use `/delete` to remove an incorrect transaction.
- Use `/budget` to view budget information.
- Use `/website` to access the analytics dashboard.

---

## Quick Command Reference

| Command | Purpose |
|---|---|
| `/start` | Start the bot |
| `/help` | Show help |
| `/website` | Open analytics dashboard |
| `/summary` | View spending summary |
| `/recent` | View recent transactions |
| `/budget` | View budget information |
| `/edit` | Edit a transaction |
| `/delete` | Delete a transaction |

---

## TelePaisa

**Telegram Bot:** https://t.me/TelePaisa_Bot

For development details, architecture, deployment, and contribution information, see the project's `Readme.md`.
