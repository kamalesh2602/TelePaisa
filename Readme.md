# AI-Powered Telegram Personal Finance Assistant

A full-stack personal finance assistant that enables conversational expense tracking through a Telegram Bot, backed by Express.js, MongoDB, and a React + Tailwind CSS web analytics dashboard.

---

## Project Overview

The AI-Powered Telegram Personal Finance Assistant simplifies tracking expenses, monitoring budgets, and receiving instant financial insights. Users interact with the bot directly via Telegram using natural messages like `"spent 300 on swiggy"` or `"set budget 5000 food"`. All financial transactions and budget limits are stored securely in MongoDB and visualized in real time via a web analytics dashboard.

---

## Features

- **Telegram Bot Messaging**: Seamless conversational expense tracking via Telegram polling.
- **Multi-User Data Isolation**: Automatic per-user expense and budget isolation using unique Telegram user/chat IDs.
- **Hybrid Expense Parsing**: Intelligent expense extraction combining AI-assisted parsing (Google Gemini API) and rule-based fallback regex mapping.
- **Budget Monitoring & Alerts**: Set category spending limits and receive instant warning alerts when approaching or exceeding budgets.
- **Financial Analytics & Queries**: Ask for total spending or category summaries directly inside Telegram.
- **Web Analytics Dashboard**: Visualize spending trends, category breakdowns, budget limits, and recent transactions with Recharts and Tailwind CSS.
- **CI/CD Integration**: Automated syntax checks and production build checks via GitHub Actions.

---

## Telegram Bot & Multi-User Behavior

### How Multi-User Data Isolation Works
When a user interacts with the Telegram bot:
1. Each message is tagged with the user's unique Telegram `msg.chat.id`.
2. All database records (`Expense` and `Budget` documents) use this unique identifier.
3. Database queries, summaries, budget checks, and dashboard metrics strictly filter by `chat.id`.
4. **Data Privacy**: Expenses, budgets, and spending totals created by User A are strictly isolated and never visible or accessible to User B.

### Making the Bot Shareable
Anyone can use the bot without any user-side configuration or manual onboarding:
1. Share the Telegram Bot link (e.g., `https://t.me/your_bot_username`) or username with any user.
2. The user opens Telegram, taps **Start** (`/start`), and begins logging expenses immediately.
3. Their financial data is isolated automatically based on their Telegram Chat ID.

---

## Supported Telegram Commands & Message Formats

The bot supports the following commands and natural text message patterns:

### 1. Welcome & Help Command (`/start`)
- **Format**: `/start`
- **Description**: Displays a welcome message and quick reference guide on how to track expenses and set budgets.

### 2. Adding an Expense
- **Formats**:
  - `spent 300 on swiggy`
  - `uber ride 200`
  - `amazon prime subscription 500`
  - `150 for coffee`
- **Description**: Parses the amount, merchant, and category, saves the transaction, and returns a confirmation message with any applicable budget status alerts.

### 3. Asking for Total Spending
- **Formats**:
  - `how much spent`
  - `total spend`
  - `how much total`
- **Description**: Calculates and returns the total cumulative spending for the user.

### 4. Category Breakdown & Insights
- **Formats**:
  - `spending summary`
  - `insight`
  - `how is my spending`
- **Description**: Returns total spending along with a breakdown of the top spending category.

### 5. Setting & Monitoring Budgets
- **Formats**:
  - `set budget 5000 food`
  - `budget 2000 travel`
  - `shopping budget 3000`
- **Description**: Creates or updates a spending budget limit for the specified category (`food`, `travel`, `shopping`, or `general`). Subsequent expense entries check against this limit and send alerts if exceeded.

---

## System Architecture

```text
Telegram User (Mobile / Desktop)
       │
       ▼ (Long Polling via node-telegram-bot-api)
Express.js Backend Server
       │
       ├─────────────────────────┐
       ▼                         ▼
Google Gemini / Fallback   MongoDB Database
Expense Parser             (Expenses & Budgets)
                                 │
                                 ▼
                         React Dashboard
                         (Recharts + Tailwind)
```

---

## Tech Stack

### Frontend
- **React** (Vite framework)
- **Tailwind CSS** (Styling)
- **Recharts** (Data Visualization)
- **Axios** (API requests)

### Backend
- **Node.js & Express.js**
- **node-telegram-bot-api** (Telegram Bot API integration via long polling)
- **Mongoose & MongoDB** (Data persistence & aggregation pipelines)
- **@google/generative-ai** (Expense parsing)

### DevOps
- **GitHub Actions** (CI pipeline)

---

## Project Structure

```text
whatsapp-ai-finance-bot/
├── models/
│   ├── Budget.js           # Mongoose schema for user budgets
│   └── Expense.js          # Mongoose schema for user expenses
├── services/
│   └── aiParser.js         # Hybrid AI/fallback expense parsing service
├── dashboard/
│   ├── src/
│   │   ├── App.jsx         # React Analytics Dashboard main component
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI pipeline
├── .env.example            # Environment variables template
├── server.js               # Express server & Telegram Bot polling listener
├── package.json            # Root dependencies & scripts
└── README.md               # Project documentation
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key
MONGO_URI=mongodb://localhost:27017/whatsapp-finance-bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

Create a `.env` file inside `dashboard/.env`:

```env
VITE_PHONE_NUMBER=your_telegram_chat_id
```

---

## Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas URI)
- A Telegram Account

---

### 2. Telegram Bot setup (via BotFather)
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` to BotFather.
3. Enter a name for your bot (e.g., `My Finance Assistant`).
4. Enter a unique username ending in `bot` (e.g., `MyPersonalFinance_bot`).
5. BotFather will generate an **HTTP API Token** (e.g., `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`).
6. Copy this token into your `.env` file as `TELEGRAM_BOT_TOKEN`.

---

### 3. Backend Setup & Execution
1. Clone the repository:
   ```bash
   git clone https://github.com/kamalesh2602/whatsapp-ai-finance-bot.git
   cd whatsapp-ai-finance-bot
   ```
2. Install root dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   The backend server will run on `http://localhost:3000` and start Telegram Bot long polling.

---

### 4. React Dashboard Setup & Execution
1. Navigate to the dashboard directory:
   ```bash
   cd dashboard
   ```
2. Install dashboard dependencies:
   ```bash
   npm install
   ```
3. Configure `dashboard/.env` with your Telegram `chat.id`:
   ```env
   VITE_PHONE_NUMBER=your_telegram_chat_id
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Access the dashboard in your browser at `http://localhost:5173`.

---

## Dashboard Features

- **Total Spending Card**: Real-time aggregation of total expenses.
- **Budget Tracking Cards**: Visual progress bars showing current category spend vs limit with percentage warnings.
- **Monthly Spending Trends**: Interactive line chart showing month-over-month expenditure trends using Recharts.
- **Category Breakdown Chart**: Interactive pie chart displaying proportional spending across categories.
- **Recent Transaction Log**: Detailed table listing recent transactions.

---

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically runs on pushes and pull requests to `main`:
- Checks backend syntax (`node --check server.js`)
- Installs frontend dependencies and verifies production build compilation (`npm run build`)

---

## Current Limitations

- **Local Polling**: Long polling requires the Node process to stay active locally.
- **AI Service Key Dependency**: If the Gemini API key is invalid or unset, the system seamlessly falls back to rule-based keyword & regex parsing.

---

## Future Improvements

- Deploy Telegram Bot using Webhooks on cloud hosting (e.g., Render, Railway, Vercel).
- Add support for custom budget duration (weekly, monthly).
- Provide export options for user financial data (CSV/PDF reports via Telegram).

---

## Author

Kamalesh G
