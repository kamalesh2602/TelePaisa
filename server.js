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

// ---------------- PERSISTENT REPLY KEYBOARD ----------------
const mainReplyKeyboard = {
  keyboard: [
    [{ text: "💰 Summary" }, { text: "🕐 Recent" }],
    [{ text: "💳 Budget" }, { text: "❓ Help" }]
  ],
  resize_keyboard: true
};

// ---------------- NATURAL ALIAS NORMALIZER ----------------
function normalizeCommandAlias(rawText) {
  if (!rawText) return null;

  const trimmed = rawText.trim();
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Strip emojis and clean string
  const clean = trimmed
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
    .trim()
    .toLowerCase();

  if (clean === "start") return "/start";
  if (clean === "help") return "/help";
  if (
    clean === "summary" ||
    clean === "show summary" ||
    clean === "how much did i spend" ||
    clean === "how much did i spend?" ||
    clean === "how much spent" ||
    clean === "how is my spending"
  ) {
    return "/summary";
  }
  if (
    clean === "recent" ||
    clean === "show recent" ||
    clean === "show recent transactions"
  ) {
    return "/recent";
  }
  if (
    clean === "budget" ||
    clean === "show budget" ||
    clean === "show my budget"
  ) {
    return "/budget";
  }

  return null;
}

// ---------------- CORE FINANCE LOGIC ----------------
async function processFinanceMessage(userId, message) {
  console.log("\nIncoming message from user", userId, ":", message);

  // Check if message is a command alias
  const aliasCommand = normalizeCommandAlias(message);
  if (aliasCommand) {
    return await handleTelegramCommand(userId, aliasCommand);
  }

  // Check if message contains a valid number for expense parsing (prevents zero-value transactions)
  if (!/\d+/.test(message)) {
    return "❌ Could not detect an expense amount. Example: 'spent 300 on swiggy' or tap /help for options.";
  }

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

  // ================= EXPENSE =================
  const data = await parseExpense(message);

  if (!data || !data.amount || data.amount <= 0) {
    return "❌ Could not detect a valid expense amount. Example: 'spent 300 on swiggy' or tap /help.";
  }

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

// ---------------- TRANSACTION RESOLVER HELPER ----------------
async function resolveUserExpense(userId, target, page = 1, pageSize = 5) {
  if (!target) return null;
  const cleanTarget = target.trim();

  if (/^\d+$/.test(cleanTarget)) {
    const num = parseInt(cleanTarget);
    if (num >= 1 && num <= pageSize) {
      const recentList = await Expense.find({ phone: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize);
      if (recentList[num - 1]) return recentList[num - 1];
    }
    // Fallback: resolve across top 50 recent items
    if (num >= 1 && num <= 50) {
      const recentList = await Expense.find({ phone: userId })
        .sort({ createdAt: -1 })
        .limit(50);
      return recentList[num - 1] || null;
    }
  }

  if (mongoose.Types.ObjectId.isValid(cleanTarget)) {
    return await Expense.findOne({ _id: cleanTarget, phone: userId });
  }

  return null;
}

// ---------------- RECENT PAGINATION HELPER ----------------
async function getRecentPageData(userId, page = 1, pageSize = 5) {
  const totalCount = await Expense.countDocuments({ phone: userId });

  if (totalCount === 0) {
    return {
      text: "No recent transactions found.",
      reply_markup: undefined
    };
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const transactions = await Expense.find({ phone: userId })
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const list = transactions
    .map((t, idx) => {
      const displayNum = idx + 1;
      const d = new Date(t.createdAt);
      const dateStr = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      const merchantInfo = t.merchant && t.merchant !== "unknown" ? ` (${t.merchant})` : "";
      return `${displayNum}. ₹${t.amount} — ${t.category}${merchantInfo} — ${dateStr}`;
    })
    .join("\n");

  const text = `🕐 Recent Transactions (Page ${currentPage} of ${totalPages})\n\n${list}\n\n💡 Use /edit <num> <amount> or /delete <num> to manage transactions on this page.`;

  const inline_keyboard = [];

  // Action buttons for displayed transactions (numbered 1..pageSize for current page)
  transactions.forEach((t, idx) => {
    const displayNum = idx + 1;
    inline_keyboard.push([
      { text: `✏️ Edit #${displayNum}`, callback_data: `edit_${t._id}` },
      { text: `🗑️ Delete #${displayNum}`, callback_data: `del_${t._id}` }
    ]);
  });

  // Navigation buttons row
  const navRow = [];
  if (currentPage > 1) {
    navRow.push({ text: "◀ Previous", callback_data: `page_${currentPage - 1}` });
  }
  if (currentPage < totalPages) {
    navRow.push({ text: "Next ▶", callback_data: `page_${currentPage + 1}` });
  }
  if (navRow.length > 0) {
    inline_keyboard.push(navRow);
  }

  return {
    text,
    reply_markup: { inline_keyboard }
  };
}

// ---------------- TELEGRAM COMMAND DISPATCHER ----------------
async function handleTelegramCommand(userId, commandText) {
  const parts = commandText.trim().split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (command === "/start") {
    return {
      text:
        "👋 Welcome to your AI Personal Finance Assistant (TelePaisa)!\n\n" +
        "Track expenses naturally or tap buttons/commands below:\n\n" +
        "💡 Commands:\n" +
        "• /help - View commands & usage guide\n" +
        "• /summary - View total spending & category breakdown\n" +
        "• /summary <category> - View spending for a specific category\n" +
        "• /recent - View recent transactions with pagination & buttons\n" +
        "• /budget - View monthly budget limits\n" +
        "• /budget <category> <amount> - Set a monthly budget\n" +
        "• /edit <num> <amount> [category] - Edit a transaction\n" +
        "• /delete <num> - Delete a transaction\n\n" +
        "💬 Natural Language Examples:\n" +
        "• \"spent 300 on swiggy\"\n" +
        "• \"uber ride 200\"",
      reply_markup: mainReplyKeyboard
    };
  }

  if (command === "/help") {
    return {
      text:
        "📖 Available Commands:\n\n" +
        "• /summary - Show total spend & category breakdown\n" +
        "• /summary <category> - Show spend for specific category (e.g. /summary food)\n" +
        "• /recent - Show paginated recent transactions\n" +
        "• /budget - Show current monthly budgets\n" +
        "• /budget <category> <amount> - Set monthly budget (e.g. /budget food 5000)\n" +
        "• /edit <num> <amount> [category] - Edit transaction (e.g. /edit 1 50 food)\n" +
        "• /delete <num> - Delete transaction (e.g. /delete 1)\n" +
        "• /help - Show this guide\n\n" +
        "💬 Natural Language Messages:\n" +
        "• \"spent 500 on food\"\n" +
        "• \"how much total\"",
      reply_markup: mainReplyKeyboard
    };
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
    const pageNum = parseInt(args[0]) || 1;
    return await getRecentPageData(userId, pageNum);
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

  if (command === "/delete") {
    if (args.length === 0) {
      return "⚠️ Usage: /delete <number>\nExample: /delete 1";
    }

    const target = args[0];
    const expense = await resolveUserExpense(userId, target);

    if (!expense) {
      return "❌ Transaction not found or unauthorized.";
    }

    await Expense.findOneAndDelete({ _id: expense._id, phone: userId });
    return `✅ Deleted transaction: ₹${expense.amount} on ${expense.category}`;
  }

  if (command === "/edit") {
    if (args.length < 2) {
      return "⚠️ Usage: /edit <number> <amount> [category]\nExample: /edit 1 50 food";
    }

    const target = args[0];
    const newAmount = parseInt(args[1]);
    const newCategory = args[2] ? args[2].toLowerCase() : null;

    if (isNaN(newAmount) || newAmount <= 0) {
      return "⚠️ Invalid amount. Please specify a positive number.\n\nUsage: /edit <number> <amount> [category]\nExample: /edit 1 50 food";
    }

    const expense = await resolveUserExpense(userId, target);

    if (!expense) {
      return "❌ Transaction not found or unauthorized.";
    }

    expense.amount = newAmount;
    if (newCategory) {
      expense.category = newCategory;
    }

    await expense.save();

    return `✅ Updated transaction: ₹${expense.amount} on ${expense.category}`;
  }

  return "❓ Unknown command. Type /help to see all available commands.";
}

// ---------------- INLINE BUTTON CALLBACK HANDLER ----------------
function setupCallbackQueryListener(botInstance) {
  if (!botInstance) return;

  botInstance.on("callback_query", async (query) => {
    if (!query.data || !query.message) return;
    const userId = query.from.id.toString();
    const data = query.data;

    if (data.startsWith("page_")) {
      const pageNum = parseInt(data.replace("page_", "")) || 1;
      const result = await getRecentPageData(userId, pageNum);
      try {
        await botInstance.answerCallbackQuery(query.id);
        await botInstance.editMessageText(result.text, {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
          reply_markup: result.reply_markup
        });
      } catch (err) {
        console.error("Error updating Telegram page:", err.message);
      }
    } else if (data.startsWith("del_")) {
      const expenseId = data.replace("del_", "");
      const deleted = await Expense.findOneAndDelete({ _id: expenseId, phone: userId });
      if (deleted) {
        await botInstance.answerCallbackQuery(query.id, { text: "Deleted!" });
        await botInstance.sendMessage(query.message.chat.id, `✅ Deleted transaction: ₹${deleted.amount} on ${deleted.category}`);
      } else {
        await botInstance.answerCallbackQuery(query.id, { text: "Transaction not found or unauthorized." });
      }
    } else if (data.startsWith("edit_")) {
      const expenseId = data.replace("edit_", "");
      const exp = await Expense.findOne({ _id: expenseId, phone: userId });
      if (exp) {
        await botInstance.answerCallbackQuery(query.id, { text: "Editing transaction" });
        await botInstance.sendMessage(
          query.message.chat.id,
          `✏️ To edit this transaction (₹${exp.amount} on ${exp.category}), send:\n\n/edit ${expenseId} <new_amount> [new_category]\n\nExample:\n/edit ${expenseId} 50 food`
        );
      } else {
        await botInstance.answerCallbackQuery(query.id, { text: "Transaction not found or unauthorized." });
      }
    }
  });
}

// ---------------- TELEGRAM MESSAGE DISPATCHER ----------------
async function handleIncomingTelegramMessage(botInstance, msg) {
  if (!msg || !msg.text) return;

  const chatId = msg.chat.id.toString();
  const text = msg.text.trim();

  const aliasCommand = normalizeCommandAlias(text);

  if (aliasCommand) {
    try {
      const result = await handleTelegramCommand(chatId, aliasCommand);
      if (typeof result === "object" && result.text) {
        await botInstance.sendMessage(msg.chat.id, result.text, { reply_markup: result.reply_markup });
      } else {
        await botInstance.sendMessage(msg.chat.id, result);
      }
    } catch (err) {
      console.error("Telegram command processing error:", err);
      await botInstance.sendMessage(msg.chat.id, "❌ Error executing command. Try /help");
    }
  } else {
    try {
      const response = await processFinanceMessage(chatId, text);
      if (typeof response === "object" && response.text) {
        await botInstance.sendMessage(msg.chat.id, response.text, { reply_markup: response.reply_markup });
      } else {
        await botInstance.sendMessage(msg.chat.id, response);
      }
    } catch (err) {
      console.error("Telegram message processing error:", err);
      await botInstance.sendMessage(msg.chat.id, "❌ Couldn't understand. Try again.");
    }
  }
}

// ---------------- TELEGRAM BOT SETUP (POLLING vs WEBHOOK) ----------------
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramMode = (process.env.TELEGRAM_MODE || "polling").toLowerCase();
let bot = null;

if (telegramToken && telegramToken !== "your_telegram_bot_token") {
  if (telegramMode === "webhook") {
    // Webhook mode (no polling)
    bot = new TelegramBot(telegramToken);
    console.log("Telegram Bot initialized in WEBHOOK mode 🌐");

    setupCallbackQueryListener(bot);

    bot.setMyCommands([
      { command: "start", description: "Start the bot & show menu" },
      { command: "help", description: "View help & usage guide" },
      { command: "summary", description: "View spending summary" },
      { command: "recent", description: "View recent transactions" },
      { command: "budget", description: "View monthly budget limits" }
    ]).catch(err => console.error("Error setting Telegram commands:", err.message));

    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    const secretToken = process.env.TELEGRAM_SECRET_TOKEN;

    if (webhookUrl) {
      console.log(webhookUrl);
      const webhookOptions = secretToken ? { secret_token: secretToken } : {};
      bot.setWebHook(webhookUrl, webhookOptions)
        .then(() => console.log(`Telegram webhook registered at: ${webhookUrl}`))
        .catch(err => console.error("Error setting Telegram webhook:", err.message));
    } else {
      console.warn("TELEGRAM_MODE is webhook, but TELEGRAM_WEBHOOK_URL is not configured.");
    }
  } else {
    // Polling mode (default for local dev)
    bot = new TelegramBot(telegramToken, { polling: true });
    console.log("Telegram Bot initialized in POLLING mode 🤖");

    setupCallbackQueryListener(bot);

    bot.setMyCommands([
      { command: "start", description: "Start the bot & show menu" },
      { command: "help", description: "View help & usage guide" },
      { command: "summary", description: "View spending summary" },
      { command: "recent", description: "View recent transactions" },
      { command: "budget", description: "View monthly budget limits" }
    ]).catch(err => console.error("Error setting Telegram commands:", err.message));

    bot.deleteWebHook()
      .then(() => console.log("Cleared active Telegram webhook for polling mode."))
      .catch(err => console.error("Error deleting Telegram webhook:", err.message));

    bot.on("message", async (msg) => {
      await handleIncomingTelegramMessage(bot, msg);
    });
  }
} else {
  console.log("TELEGRAM_BOT_TOKEN not provided or default. Telegram bot inactive.");
}

// ---------------- TELEGRAM WEBHOOK ENDPOINT ----------------
app.post("/telegram/webhook", async (req, res) => {
  // Validate secret token if TELEGRAM_SECRET_TOKEN is set
  const secretToken = process.env.TELEGRAM_SECRET_TOKEN;
  if (secretToken) {
    const headerToken = req.headers["x-telegram-bot-api-secret-token"];
    if (headerToken !== secretToken) {
      console.warn("Unauthorized Telegram webhook request: secret token mismatch");
      return res.status(403).json({ error: "Unauthorized" });
    }
  }

  // Respond immediately with HTTP 200 OK to Telegram
  res.sendStatus(200);

  const update = req.body;
  if (update) {
    if (update.message) {
      if (bot) {
        try {
          await handleIncomingTelegramMessage(bot, update.message);
        } catch (err) {
          console.error("Error handling Telegram webhook message:", err);
        }
      }
    } else if (update.callback_query) {
      if (bot) {
        bot.emit("callback_query", update.callback_query);
      }
    }
    // Note: update.edited_message is deliberately ignored so editing a Telegram message doesn't mutate DB records
  }
});

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

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});