# AI-Powered Telegram Personal Finance Assistant

A full-stack personal finance assistant that enables conversational expense tracking through a Telegram Bot, backed by Express.js, MongoDB, and a React + Tailwind CSS web analytics dashboard.

---

## Project Overview

Managing personal finances often feels cumbersome when using rigid spreadsheet tools or manual entry apps. The **AI-Powered Telegram Personal Finance Assistant** solves this problem by bringing expense tracking directly into Telegram. Users can log transactions using structured slash commands (e.g. `/budget food 5000`, `/summary`) or natural text messages (e.g. `"spent 300 on swiggy"`). All financial data is securely saved in MongoDB and visualized in real-time through an interactive web dashboard.

---

## Key Features

- **Telegram Bot Integration**: Multi-user conversational interface running on Node.js using long polling.
- **Structured Slash Commands**: Explicit commands (`/start`, `/help`, `/summary`, `/recent`, `/budget`) with input validation and usage guidance.
- **Hybrid Expense Parsing**: Intelligent transaction extraction combining Google Gemini AI API parsing with a rule-based fallback keyword and regex parser.
- **Multi-User Data Isolation**: Secure data partitioning based on unique Telegram Chat IDs (`msg.chat.id`), ensuring user records remain completely private.
- **Monthly Budgeting & Alerts**: Category-based monthly limit setting with instant over-budget warning notifications.
- **Web Analytics Dashboard**: Interactive React + Tailwind CSS dashboard built with Recharts displaying total spending, monthly trends, category pie charts, budget progress bars, and recent transactions.
- **CI/CD Pipeline**: GitHub Actions workflow verifying backend syntax and frontend production builds.

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

## Multi-User Data Isolation Architecture

- **User Identifier**: The backend extracts `msg.chat.id.toString()` for every incoming Telegram message and uses it as the primary user identifier (`phone` string field in Mongoose schemas).
- **Data Privacy**: All database queries (`find`, `aggregate`, `findOneAndUpdate`) strictly match `{ phone: userId }`.
- **Zero Onboarding Friction**: Users simply start a conversation with the Telegram bot; the backend automatically isolates their data without requiring user registration or manual ID setup.

---

## Tech Stack

### Backend
- **Node.js & Express.js**
- **node-telegram-bot-api** (Telegram Bot API integration via long polling)
- **Mongoose & MongoDB** (Database ORM & aggregation pipelines)
- **@google/generative-ai** (AI expense parsing)

### Frontend
- **React** (Vite framework)
- **Tailwind CSS** (Styling)
- **Recharts** (Interactive data visualization)
- **Axios** (REST API integration)

### DevOps & Tools
- **GitHub Actions** (CI pipeline)
- **dotenv** (Environment variable management)

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
│       └── ci.yml          # GitHub Actions CI workflow
├── DOCUMENTATION.md        # Telegram Bot user manual
├── Readme.md               # Developer documentation & project guide
├── .env.example            # Backend environment template
├── server.js               # Express server & Telegram Bot polling dispatcher
└── package.json            # Root dependencies & scripts
```

---

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local instance or MongoDB Atlas connection string)
- A Telegram Account (to configure a bot via `@BotFather`)

---

## Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key
MONGO_URI=mongodb://localhost:27017/whatsapp-finance-bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

Create a `.env` file in `dashboard/.env`:

```env
VITE_PHONE_NUMBER=your_telegram_chat_id
```

---

## Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/kamalesh2602/whatsapp-ai-finance-bot.git
cd whatsapp-ai-finance-bot
```

### 2. Telegram Bot Setup (via BotFather)
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the prompts to choose a Bot Name and Username.
3. Copy the generated **HTTP API Token**.
4. Set `TELEGRAM_BOT_TOKEN=<your_token>` in your root `.env` file.

### 3. Backend Setup & Execution
1. Install root dependencies:
   ```bash
   npm install
   ```
2. Start the Express server and Telegram polling:
   ```bash
   npm start
   ```
   The backend will start listening on `http://localhost:3000` and initiate Telegram polling.

### 4. React Dashboard Setup & Execution
1. Navigate to the `dashboard` directory:
   ```bash
   cd dashboard
   ```
2. Install dashboard dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to view the analytics dashboard for the configured Telegram Chat ID.

---

## User Manual & Telegram Bot Usage

For the complete Telegram bot user guide, command list, syntax examples, and natural language walkthroughs, see [DOCUMENTATION.md](file:///d:/Kamalesh_projects/whatsapp-ai-finance-bot/DOCUMENTATION.md).

---

## CI/CD Pipeline

Automated checks are configured in `.github/workflows/ci.yml`:
- **Backend Job**: Runs `node --check server.js` to ensure syntax validity.
- **Frontend Job**: Installs dashboard dependencies and runs `npm run build` to verify production compilation.

---

## Current Limitations

- **Long Polling Mode**: Local development uses Telegram polling; production deployments would benefit from Webhook integration.
- **AI Key Dependency**: If `GEMINI_API_KEY` is invalid or unset, the system automatically falls back to rule-based regex parsing.

---

## Future Improvements

- Deploy Telegram Bot via Webhooks on cloud platforms (e.g. Render, Railway, Vercel).
- Multi-currency support and conversion.
- Automated monthly spending report exports (CSV/PDF) via Telegram.

---

## Author

Kamalesh G
