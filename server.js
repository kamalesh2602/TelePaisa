import dotenv from "dotenv";
dotenv.config();
console.log("KEY:", process.env.GEMINI_API_KEY);
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import TelegramBot from "node-telegram-bot-api";
import { parseExpense } from "./services/aiParser.js";
import Expense from "./models/Expense.js";
import Budget from "./models/Budget.js";

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---------------- DB ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ---------------- TEST ----------------
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// ---------------- HELPERS ----------------
function isExpense(text) {
  return /\d+/.test(text);
}

function isQuery(text) {
  const msg = text.toLowerCase();
  return (
    msg.includes("how much") ||
    msg.includes("total") ||
    msg.includes("spend")
  );
}

function isInsightQuery(text) {
  const msg = text.toLowerCase();
  return (
    msg.includes("summary") ||
    msg.includes("insight") ||
    msg.includes("how is my spending")
  );
}

function isBudgetSet(text) {
  return text.toLowerCase().includes("budget");
}

function extractCategory(text) {
  const msg = text.toLowerCase();

  if (msg.includes("food")) return "food";
  if (msg.includes("travel")) return "travel";
  if (msg.includes("shopping")) return "shopping";

  return "general";
}

// ---------------- CORE FINANCE LOGIC ----------------
async function processFinanceMessage(userId, message) {
  console.log("\nIncoming message from user", userId, ":", message);

  // ================= SET BUDGET =================
  if (isBudgetSet(message)) {
    const amount = parseInt(message.match(/\d+/)?.[0] || 0);
    const category = extractCategory(message);

    await Budget.findOneAndUpdate(
      { phone: userId, category },
      { limit: amount },
      { upsert: true }
    );

    return `✅ Budget set: ₹${amount} for ${category}`;
  }

  // ================= INSIGHTS =================
  if (isInsightQuery(message)) {
    const data = await Expense.aggregate([
      { $match: { phone: userId } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    if (!data.length) {
      return "No data yet. Start adding expenses.";
    }

    const total = data.reduce((sum, i) => sum + i.total, 0);
    const top = data.sort((a, b) => b.total - a.total)[0];

    return `💰 Total: ₹${total}\n📊 Top: ${top._id} (₹${top.total})`;
  }

  // ================= QUERY =================
  if (!isExpense(message) && isQuery(message)) {
    const total = await Expense.aggregate([
      { $match: { phone: userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const amount = total[0]?.total || 0;

    return `💰 You spent ₹${amount}`;
  }

  // ================= EXPENSE =================
  const data = await parseExpense(message);

  const expense = await Expense.create({
    ...data,
    phone: userId
  });

  // 🔥 BUDGET CHECK
  const budget = await Budget.findOne({
    phone: userId,
    category: data.category
  });

  let alert = "";

  if (budget) {
    const total = await Expense.aggregate([
      { $match: { phone: userId, category: data.category } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const spent = total[0]?.total || 0;
    const percent = ((spent / budget.limit) * 100).toFixed(1);

    alert = `\n⚠️ ${data.category}: ₹${spent}/${budget.limit} (${percent}%)`;

    if (spent > budget.limit) {
      alert += "\n🚨 Budget exceeded!";
    }
  }

  return `✅ Added ₹${expense.amount} to ${expense.category}${alert}`;
}

// ---------------- TELEGRAM COMMAND DISPATCHER ----------------
async function handleTelegramCommand(userId, commandText) {
  const parts = commandText.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (command === "/start") {
    return (
      "👋 Welcome to your AI Personal Finance Assistant!\n\n" +
      "Track expenses naturally or use slash commands:\n\n" +
      "💡 Commands:\n" +
      "• /help - View commands & usage guide\n" +
      "• /summary - View total spending & category breakdown\n" +
      "• /summary <category> - View spending for a specific category\n" +
      "• /recent - View recent transactions\n" +
      "• /budget - View monthly budget limits\n" +
      "• /budget <category> <amount> - Set a monthly budget\n\n" +
      "💬 Natural Language Examples:\n" +
      "• \"spent 300 on swiggy\"\n" +
      "• \"uber ride 200\""
    );
  }

  if (command === "/help") {
    return (
      "📖 Available Commands:\n\n" +
      "• /summary - Show total spend & category breakdown\n" +
      "• /summary <category> - Show spend for specific category (e.g. /summary food)\n" +
      "• /recent - Show last 5 transactions\n" +
      "• /budget - Show current monthly budgets\n" +
      "• /budget <category> <amount> - Set monthly budget (e.g. /budget food 5000)\n" +
      "• /help - Show this guide\n\n" +
      "💬 Natural Language Messages:\n" +
      "• \"spent 500 on food\"\n" +
      "• \"how much total\""
    );
  }

  if (command === "/summary") {
    if (args.length > 0) {
      const category = args[0].toLowerCase();
      const data = await Expense.aggregate([
        { $match: { phone: userId, category } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } }
      ]);

      if (!data.length) {
        return `No expenses found for category: ${category}`;
      }

      return `📊 ${category.toUpperCase()} Spending Summary:\n💰 Total Spent: ₹${data[0].total}`;
    } else {
      const data = await Expense.aggregate([
        { $match: { phone: userId } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } }
      ]);

      if (!data.length) {
        return "No data yet. Start adding expenses.";
      }

      const total = data.reduce((sum, i) => sum + i.total, 0);
      const sorted = [...data].sort((a, b) => b.total - a.total);
      const top = sorted[0];

      let breakdown = data.map(i => `• ${i._id}: ₹${i.total}`).join("\n");

      return `📊 Spending Summary:\n💰 Total Spent: ₹${total}\n\nCategories:\n${breakdown}\n\n🏆 Top Category: ${top._id} (₹${top.total})`;
    }
  }

  if (command === "/recent") {
    const transactions = await Expense.find({ phone: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    if (!transactions.length) {
      return "No recent transactions found.";
    }

    const list = transactions
      .map((t, idx) => {
        const dateStr = new Date(t.createdAt).toLocaleDateString();
        const merchantInfo = t.merchant && t.merchant !== "unknown" ? ` (${t.merchant})` : "";
        return `${idx + 1}. ₹${t.amount} on ${t.category}${merchantInfo} - ${dateStr}`;
      })
      .join("\n");

    return `🕒 Recent Transactions:\n\n${list}`;
  }

  if (command === "/budget") {
    if (args.length === 0) {
      const budgets = await Budget.find({ phone: userId });

      if (!budgets.length) {
        return (
          "No monthly budgets set yet.\n\n" +
          "Usage: /budget <category> <amount>\n" +
          "Example: /budget food 5000"
        );
      }

      let resultList = [];
      for (const budget of budgets) {
        const total = await Expense.aggregate([
          { $match: { phone: userId, category: budget.category } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const spent = total[0]?.total || 0;
        const percent = ((spent / budget.limit) * 100).toFixed(1);
        const status = spent > budget.limit ? " 🚨 Exceeded!" : "";

        resultList.push(`• ${budget.category}: ₹${spent} / ₹${budget.limit} (${percent}%)${status}`);
      }

      return `🎯 Monthly Budgets:\n\n${resultList.join("\n")}\n\nTo set/update a budget:\n/budget <category> <amount>`;
    }

    if (args.length === 2) {
      const category = args[0].toLowerCase();
      const amount = parseInt(args[1]);

      if (isNaN(amount) || amount <= 0) {
        return "⚠️ Invalid amount. Please specify a positive number.\n\nUsage: /budget <category> <amount>\nExample: /budget food 5000";
      }

      await Budget.findOneAndUpdate(
        { phone: userId, category },
        { limit: amount },
        { upsert: true }
      );

      return `✅ Monthly budget set: ₹${amount} for ${category}`;
    }

    return "⚠️ Invalid syntax.\n\nUsage: /budget <category> <amount>\nExample: /budget food 5000";
  }

  return "❓ Unknown command. Type /help to see all available commands.";
}

// ---------------- TELEGRAM BOT (POLLING) ----------------
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;

if (telegramToken && telegramToken !== "your_telegram_bot_token") {
  const bot = new TelegramBot(telegramToken, { polling: true });
  console.log("Telegram Bot initialized with polling 🤖");

  // Handle all incoming text messages & commands
  bot.on("message", async (msg) => {
    if (!msg.text) return;

    const chatId = msg.chat.id.toString();
    const text = msg.text.trim();

    if (text.startsWith("/")) {
      try {
        const response = await handleTelegramCommand(chatId, text);
        bot.sendMessage(msg.chat.id, response);
      } catch (err) {
        console.error("Telegram command processing error:", err);
        bot.sendMessage(msg.chat.id, "❌ Error executing command. Try /help");
      }
    } else {
      try {
        const response = await processFinanceMessage(chatId, text);
        bot.sendMessage(msg.chat.id, response);
      } catch (err) {
        console.error("Telegram message processing error:", err);
        bot.sendMessage(msg.chat.id, "❌ Couldn't understand. Try again.");
      }
    }
  });
} else {
  console.log("TELEGRAM_BOT_TOKEN not provided or default. Telegram polling inactive.");
}

// ---------------- DASHBOARD API ENDPOINTS ----------------

function extractUserIdentifier(req) {
  const raw = req.query.phone || req.query.userId || req.query.chatId || "";
  return decodeURIComponent(raw);
}

app.get("/api/summary", async (req, res) => {
  const phone = extractUserIdentifier(req);

  const total = await Expense.aggregate([
    { $match: { phone } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const category = await Expense.aggregate([
    { $match: { phone } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } }
  ]);

  res.json({
    total: total[0]?.total || 0,
    category
  });
});

app.get("/api/trend", async (req, res) => {
  const phone = extractUserIdentifier(req);

  const trend = await Expense.aggregate([
    { $match: { phone } },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        total: { $sum: "$amount" }
      }
    }
  ]);

  res.json(trend);
});

app.get("/api/budgets", async (req, res) => {
  const phone = extractUserIdentifier(req);

  const budgets = await Budget.find({ phone });

  const result = [];

  for (const budget of budgets) {
    const total = await Expense.aggregate([
      {
        $match: {
          phone,
          category: budget.category
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const spent = total[0]?.total || 0;

    result.push({
      category: budget.category,
      limit: budget.limit,
      spent,
      percent: ((spent / budget.limit) * 100).toFixed(1)
    });
  }

  res.json(result);
});

app.get("/api/recent", async (req, res) => {
  const phone = extractUserIdentifier(req);

  const transactions = await Expense.find({ phone })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(transactions);
});

// ---------------- START ----------------
app.listen(3000, () => {
  console.log("Server running on port 3000 🚀");
});