const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

// 🔐 Environment Variables
const token = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);

if (!token) {
  console.error("BOT_TOKEN is missing!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("Bot is running...");

// 📂 Ensure tickets folder exists
const ticketsFolder = path.join(__dirname, "tickets");
if (!fs.existsSync(ticketsFolder)) {
  fs.mkdirSync(ticketsFolder);
}

// 📄 Ensure tickets.json exists
const ticketsFile = path.join(__dirname, "tickets.json");
if (!fs.existsSync(ticketsFile)) {
  fs.writeFileSync(ticketsFile, JSON.stringify([]));
}

// 📖 Load tickets
function loadTickets() {
  return JSON.parse(fs.readFileSync(ticketsFile));
}

// 💾 Save tickets
function saveTickets(data) {
  fs.writeFileSync(ticketsFile, JSON.stringify(data, null, 2));
}

// 👋 /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const tickets = loadTickets();

  if (tickets.length === 0) {
    return bot.sendMessage(chatId, "No tickets available right now.");
  }

  const keyboard = tickets.map((ticket, index) => {
    return [{ text: ticket.name, callback_data: `ticket_${index}` }];
  });

  bot.sendMessage(chatId, "Hello 👋\nPlease select your travel date:", {
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });
});

// 📎 Handle PDF upload (ADMIN ONLY)
bot.on("document", (msg) => {
  const chatId = msg.chat.id;

  if (chatId !== ADMIN_ID) {
    return bot.sendMessage(chatId, "You are not authorized.");
  }

  const file = msg.document;

  if (file.mime_type !== "application/pdf") {
    return bot.sendMessage(chatId, "Please upload a PDF file.");
  }

  const fileId = file.file_id;
  const fileName = file.file_name;
  const filePath = path.join(ticketsFolder, fileName);

  bot.downloadFile(fileId, ticketsFolder).then((downloadedPath) => {
    const tickets = loadTickets();

    tickets.push({
      name: fileName.replace(".pdf", ""),
      file: fileName,
    });

    saveTickets(tickets);

    bot.sendMessage(chatId, `Ticket "${fileName}" uploaded successfully ✅`);
  });
});

// 🎯 Handle button click
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const tickets = loadTickets();

  const index = query.data.split("_")[1];

  if (!tickets[index]) {
    return bot.answerCallbackQuery(query.id, {
      text: "Ticket not found",
    });
  }

  const filePath = path.join(ticketsFolder, tickets[index].file);

  if (!fs.existsSync(filePath)) {
    return bot.sendMessage(chatId, "File missing on server.");
  }

  bot.sendDocument(chatId, filePath);
  bot.answerCallbackQuery(query.id);
});
