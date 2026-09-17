# TelePaisa - Telegram Personal Finance Assistant

A full-stack personal finance assistant that enables conversational expense tracking through a Telegram Bot, backed by Express.js, MongoDB, and a lightweight server-served HTML/CSS/JavaScript analytics dashboard.

🤖 **Try TelePaisa:** https://t.me/TelePaisa_Bot

---

## Project Overview

Managing personal finances often feels cumbersome when using rigid spreadsheet tools or manual-entry applications.

**TelePaisa** brings expense tracking directly into Telegram. Users can:

- Log expenses using natural language
- Use structured Telegram commands
- Set and monitor category-based budgets
- View spending summaries
- Edit and delete transactions
- Open a web-based analytics dashboard

All financial data is stored in MongoDB and associated with the user's Telegram Chat ID, providing isolated data access between users.

---

## Key Features

### Telegram Expense Tracking

Track expenses using natural messages such as:

```text
spent 300 on swiggy
uber ride 200
bought pens for 150
```

TelePaisa extracts the relevant transaction information and stores it automatically.

### Structured Commands

Supported commands:

```text
/start
/help
/summary
/summary <category>
/recent
/budget
/budget <category> <amount>
/edit <num> <amount> [category]
/delete <num>
/website
```

Telegram commands are also registered in the native `/` command menu.

### Natural Language Aliases

Common actions can also be triggered using natural aliases:

```text
summary
recent
budget
help
website
```

The persistent Telegram keyboard provides quick access to:

```text
💰 Summary    🕐 Recent
💳 Budget     ❓ Help
```

### Paginated Recent Transactions

The `/recent` command displays transactions five at a time with:

- Previous / Next pagination
- Edit buttons
- Delete buttons
- In-place Telegram message updates

### Monthly Budgets

Users can define category-based monthly budgets:

```text
/budget food 5000
/budget travel 3000
/budget education 2000
```

TelePaisa tracks spending against the configured budget and provides alerts when a category exceeds its limit.

### Transaction Management

Users can edit or delete transactions:

```text
/edit 1 50 food
/delete 1
```

### Expanded Expense Categories

TelePaisa supports 11 expense categories:

```text
food
travel
shopping
education
bills
entertainment
health
subscriptions
personal_care
recharge
general
```

The categories include dedicated handling for common college and student expenses such as books, stationery, project materials, and examination fees.

### Multi-User Data Isolation

Each Telegram user is identified using their unique Telegram Chat ID.

Expense and budget queries are scoped to that identifier so that users' records remain logically separated.

### Web Analytics Dashboard

TelePaisa includes a lightweight dashboard served directly by Express.

The dashboard provides:

- Total spending
- Category breakdown
- Monthly spending trends
- Budget status
- Recent transactions
- Responsive layout
- Indian Rupee formatting

The dashboard can be opened from Telegram using:

```text
/website
```

### Telegram Transport Modes

TelePaisa supports:

- **Polling** for local development
- **HTTPS Webhooks** for production deployment

The transport mode is controlled through environment variables.

### Production Deployment

The backend is designed for Render and supports:

- HTTPS Telegram webhooks
- Dynamic Render `$PORT`
- Automatic webhook registration
- Optional Telegram webhook secret validation
- MongoDB Atlas
- Express-served dashboard

### CI/CD

GitHub Actions performs automated checks for:

- Backend syntax
- Dashboard production build

---

## System Architecture

### Production - Webhook Mode

```text
Telegram User
      │
      ▼
Telegram Servers
      │
      │ HTTPS POST
      ▼
Render / Express Backend
      │
      ├── Telegram Webhook
      ├── Finance Logic
      ├── REST APIs
      │
      ├───────────────► MongoDB
      │                  ├── Expenses
      │                  └── Budgets
      │
      └───────────────► Web Dashboard
                         HTML / CSS / JS
                         Chart.js
```

### Local Development - Polling Mode

```text
Telegram User
      │
      ▼
Telegram Servers
      ▲
      │ Long Polling
      ▼
Local Express Server
      │
      ├── Finance Logic
      ├── REST APIs
      └── MongoDB
```

---

## Multi-User Data Isolation

TelePaisa uses Telegram Chat IDs as the user identifier.

For every incoming message:

```js
const chatId = msg.chat.id.toString();
```

The identifier is stored with transactions:

```js
{
  phone: userId
}
```

Database queries are scoped to the current user:

```js
{ phone: userId }
```

This allows multiple users to use the same bot while keeping their transaction data logically separated.

No separate registration or onboarding process is required.

---

## Tech Stack

### Backend

- **Node.js**
- **Express.js**
- **node-telegram-bot-api**
- **MongoDB**
- **Mongoose**
- **dotenv**

### Dashboard

- **HTML5**
- **CSS3**
- **Vanilla JavaScript**
- **Chart.js**

The dashboard is served directly by the Express backend and does not require a separate frontend deployment.

### DevOps & Tools

- **Render**
- **GitHub Actions**
- **MongoDB Atlas**
- **Git**

---

## Project Structure

```text
TelePaisa/
│
├── constants/
│   └── categories.js
│
├── models/
│   ├── Budget.js
│   └── Expense.js
│
├── services/
│   └── aiParser.js
│
├── public/
│   └── dashboard/
│       ├── index.html
│       ├── style.css
│       └── script.js
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows/
│       └── ci.yml
│
├── server.js
├── package.json
├── package-lock.json
├── DOCUMENTATION.md
└── README.md
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
MONGO_URI=mongodb://localhost:27017/telepaisa

TELEGRAM_BOT_TOKEN=your_telegram_bot_token

TELEGRAM_MODE=polling

TELEGRAM_WEBHOOK_URL=https://<your-render-service>.onrender.com/telegram/webhook

TELEGRAM_SECRET_TOKEN=your_optional_secret_token

PORT=3000
```

### Environment Variable Reference

| Variable | Description | Required |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | Yes |
| `TELEGRAM_BOT_TOKEN` | Telegram BotFather token | Yes |
| `TELEGRAM_MODE` | `polling` or `webhook` | No |
| `TELEGRAM_WEBHOOK_URL` | Public HTTPS webhook endpoint | Required in webhook mode |
| `TELEGRAM_SECRET_TOKEN` | Optional Telegram webhook authentication token | No |
| `PORT` | HTTP server port | No |

> Never commit real credentials or bot tokens to the repository.

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/kamalesh2602/TelePaisa.git
cd TelePaisa
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

```env
MONGO_URI=mongodb://localhost:27017/telepaisa
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_MODE=polling
```

### 4. Start the server

```bash
node server.js
```

In polling mode, the application automatically clears an existing Telegram webhook before starting polling.

### 5. Open the dashboard

Once the server is running:

```text
http://localhost:3000/dashboard?phone=<telegram_chat_id>
```

---

## Production Deployment on Render

### Step 1: Create the Web Service

Connect the GitHub repository to Render and create a **Web Service**.

Recommended configuration:

```text
Environment: Node
Build Command: npm install
Start Command: node server.js
```

### Step 2: Add Environment Variables

Configure these variables in Render:

```text
MONGO_URI=<your-mongodb-connection-string>

TELEGRAM_BOT_TOKEN=<your-botfather-token>

TELEGRAM_MODE=webhook

TELEGRAM_WEBHOOK_URL=https://<your-render-service>.onrender.com/telegram/webhook

TELEGRAM_SECRET_TOKEN=<optional-secret-token>
```

### Step 3: Deploy

After deployment, the application starts the Express server first and then initializes the Telegram bot.

Expected logs:

```text
Server running on port 10000 🚀
Telegram Bot initialized in WEBHOOK mode 🌐
Registering Telegram webhook: [https://<service>.onrender.com/telegram/webhook]
Telegram webhook registered at: https://<service>.onrender.com/telegram/webhook
MongoDB connected
```

---

## Checking Webhook Status

Use the Telegram Bot API to inspect the current webhook configuration:

```text
https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/getWebhookInfo
```

The response contains the currently registered webhook URL and pending update count.

---

## User Manual

For the complete command reference, usage examples, and bot workflow, see:

**[DOCUMENTATION.md](DOCUMENTATION.md)**

---

## Contributing

TelePaisa is open to contributions.

You can:

- Report bugs
- Suggest new features
- Improve documentation
- Improve the dashboard
- Improve expense categorization
- Add useful finance-related functionality

Use the GitHub issue templates when opening a bug report or feature request.

---

## Try TelePaisa

🤖 **Telegram Bot:** https://t.me/TelePaisa_Bot

Start the bot and send:

```text
/start
```

Then try:

```text
spent 300 on swiggy
```

or:

```text
/summary
```

---

## CI/CD Pipeline

Automated checks are configured in:

```text
.github/workflows/ci.yml
```

The pipeline verifies:

- Backend syntax using `node --check server.js`
- Dashboard production compilation

---

## Author

**Kamalesh G**

GitHub: https://github.com/kamalesh2602
