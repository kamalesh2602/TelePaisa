# TelePaisa - AI-Powered Telegram Personal Finance Assistant

A full-stack personal finance assistant that enables conversational expense tracking through a Telegram Bot (`TelePaisa`), backed by Express.js, MongoDB, and an integrated server-served HTML/CSS/JS analytics dashboard.

---

## Project Overview

Managing personal finances often feels cumbersome when using rigid spreadsheet tools or manual entry apps. **TelePaisa** solves this problem by bringing expense tracking directly into Telegram. Users can log transactions using structured slash commands (e.g. `/budget food 5000`, `/summary`), natural text messages (e.g. `"spent 300 on swiggy"`), or open the analytics dashboard using `/website`. All financial data is securely saved in MongoDB and visualized in real-time through an interactive web dashboard.

---

## Key Features

- **Dual Telegram Transport Support**: Supports both **Local Polling** (for local development) and **HTTPS Webhooks** (for Render production deployment) via configuration.
- **Structured Slash Commands & Native Menu**: Explicit commands (`/start`, `/help`, `/summary`, `/recent`, `/budget`, `/edit`, `/delete`, `/website`) with native Telegram `/` popup menu auto-registration.
- **Persistent Reply Keyboard & Natural Aliases**: Persistent 4-button keyboard (`💰 Summary`, `🕐 Recent`, `💳 Budget`, `❓ Help`) and case-insensitive natural aliases (`recent`, `summary`, `budget`, `help`, `website`).
- **Scalable Paginated Recent Transactions**: Paginated `/recent` transactions (5 per page) with in-place message updating (`[ ◀ Previous ]` / `[ Next ▶ ]`) and inline action buttons (`[✏️ Edit]` / `[🗑 Delete]`).
- **Zero-Value Expense Safeguard**: Intercepts command aliases and non-numeric messages to prevent invalid ₹0 expense creation.
- **Hybrid Expense Parsing & Expanded Categories**: Intelligent transaction extraction supporting 11 categories (`food`, `travel`, `shopping`, `education`, `bills`, `entertainment`, `health`, `subscriptions`, `personal_care`, `recharge`, `general`) with special detection for college student expenses.
- **Multi-User Data Isolation**: Secure data partitioning based on unique Telegram Chat IDs (`msg.chat.id`), ensuring user records remain completely private.
- **Monthly Budgeting & Alerts**: Category-based monthly limit setting with instant over-budget warning notifications.
- **Server-Served Web Analytics Dashboard**: Lightweight HTML, CSS, and Vanilla JavaScript dashboard served directly by Express at `GET /dashboard` using Chart.js visualization.
- **Render Production Deployment Ready**: Auto-registers Telegram webhook on startup, validates Telegram secret tokens (`x-telegram-bot-api-secret-token`), and dynamically binds to Render `$PORT`.
- **CI/CD Pipeline**: GitHub Actions workflow verifying backend syntax and frontend production builds.

---

## System Architecture

### 1. Webhook Mode (Production / Render)
```text
Telegram User ──> Telegram Servers ──> HTTPS POST /telegram/webhook ──> Render Express Backend
                                                                               │
                                                                   ┌───────────┴───────────┐
                                                                   ▼                       ▼
                                                            Gemini / Fallback       MongoDB Database
                                                             Expense Parser        (Expenses & Budgets)
                                                                                           │
                                                                                           ▼
                                                                                    React Dashboard
```

### 2. Polling Mode (Local Development)
```text
Telegram User ──> Telegram Servers <── Long Polling (node-telegram-bot-api) ──> Local Express Server
```

---

## Multi-User Data Isolation Architecture

- **User Identifier**: The backend extracts `msg.chat.id.toString()` for every incoming Telegram message and uses it as the primary user identifier (`phone` string field in Mongoose schemas).
- **Data Privacy**: All database queries (`find`, `aggregate`, `findOneAndUpdate`) strictly match `{ phone: userId }`.
- **Zero Onboarding Friction**: Users simply start a conversation with the TelePaisa bot; the backend automatically isolates their data without requiring user registration or manual ID setup.

---

## Tech Stack

### Backend
- **Node.js & Express.js**
- **node-telegram-bot-api** (Telegram Bot API integration with polling & webhook support)
- **Mongoose & MongoDB** (Database ORM & aggregation pipelines)
- **@google/generative-ai** (AI expense parsing)

### Frontend
- **React** (Vite framework)
- **Tailwind CSS** (Styling)
- **Recharts** (Interactive data visualization)
- **Axios** (REST API integration)

### DevOps & Tools
- **Render** (Cloud deployment)
- **GitHub Actions** (CI pipeline)
- **dotenv** (Environment variable management)

---

## Environment Variables

### Root `.env` (Backend Server)

| Variable | Description | Example / Default | Required |
| :--- | :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Atlas / Local connection string | `mongodb://localhost:27017/telepaisa` | Yes |
| `TELEGRAM_BOT_TOKEN` | HTTP API Token from Telegram BotFather | `123456789:ABCdef...` | Yes |
| `TELEGRAM_MODE` | Bot transport mode (`polling` or `webhook`) | `polling` (Local) / `webhook` (Render) | No (Default: `polling`) |
| `TELEGRAM_WEBHOOK_URL` | Public HTTPS Webhook endpoint on Render | `https://<service>.onrender.com/telegram/webhook` | Required in Webhook mode |
| `TELEGRAM_SECRET_TOKEN` | Secret token to authenticate Telegram updates | `my_secret_token_123` | Optional (Recommended for Webhook) |
| `GEMINI_API_KEY` | Google Gemini AI key | `AIzaSy...` | Optional (Uses fallback parser if unset) |
| `PORT` | Dynamic HTTP server port | `3000` | Render sets automatically |

### Dashboard `.env` (`dashboard/.env`)
```env
VITE_PHONE_NUMBER=your_telegram_chat_id
```

---

## Local Development (Polling Mode)

1. Clone repository & install dependencies:
   ```bash
   git clone https://github.com/kamalesh2602/TelePaisa.git
   cd TelePaisa
   npm install
   ```
2. Create root `.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/telepaisa
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_MODE=polling
   ```
3. Start local backend server:
   ```bash
   npm start
   ```
   *Note: In polling mode, the backend automatically clears any previously registered webhooks to ensure smooth local operation.*

4. Start React dashboard:
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```

---

## Production Deployment on Render (Webhook Mode)

### Step 1: Create Web Service on Render
1. Connect your GitHub repository (`https://github.com/kamalesh2602/TelePaisa`) to [Render](https://render.com).
2. Choose **Web Service**.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js` (or `npm start`)

### Step 2: Add Environment Variables in Render Dashboard
Add the following key-value pairs under **Environment** settings in Render:
- `MONGO_URI` $\rightarrow$ `mongodb+srv://<user>:<password>@cluster.mongodb.net/telepaisa`
- `TELEGRAM_BOT_TOKEN` $\rightarrow$ `<your_botfather_token>`
- `TELEGRAM_MODE` $\rightarrow$ `webhook`
- `TELEGRAM_WEBHOOK_URL` $\rightarrow$ `https://<your-render-service>.onrender.com/telegram/webhook`
- `TELEGRAM_SECRET_TOKEN` $\rightarrow$ `<your_secret_token>` (Optional)

### Step 3: Deploy & Verify
1. Click **Deploy Web Service**.
2. On boot, the server automatically calls Telegram API `setWebHook` to register `TELEGRAM_WEBHOOK_URL`.
3. Check deployment logs:
   ```text
   Server running on port 10000 🚀
   MongoDB connected
   Telegram Bot initialized in WEBHOOK mode 🌐
   Telegram webhook registered at: https://<service>.onrender.com/telegram/webhook
   ```

---

## Checking Webhook Status

To inspect your bot's Telegram webhook status, open the following URL in your browser or curl:
```bash
https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/getWebhookInfo
```

---

## User Manual & Telegram Bot Usage

For the complete TelePaisa bot user guide, command list, syntax examples, and natural language walkthroughs, see [DOCUMENTATION.md](file:///d:/Kamalesh_projects/whatsapp-ai-finance-bot/DOCUMENTATION.md).

---

## CI/CD Pipeline

Automated checks are configured in `.github/workflows/ci.yml`:
- **Backend Job**: Runs `node --check server.js` to ensure syntax validity.
- **Frontend Job**: Installs dashboard dependencies and runs `npm run build` to verify production compilation.

---

## Author

Kamalesh G
