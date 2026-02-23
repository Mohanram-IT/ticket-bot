const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const token = process.env.BOT_TOKEN;
const ADMIN_ID = 1064327506; // 🔴 CHANGE TO YOUR TELEGRAM USER ID

const bot = new TelegramBot(token, { polling: true });

console.log("Bot is running...");

// Load tickets
function loadTickets() {
  if (!fs.existsSync("tickets.json")) {
    fs.writeFileSync("tickets.json", JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync("tickets.json"));
}

// Save tickets
function saveTickets(tickets) {
  fs.writeFileSync("tickets.json", JSON.stringify(tickets, null, 2));
}

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const tickets = loadTickets();

  if (tickets.length === 0) {
    return bot.sendMessage(chatId, "No tickets available right now.");
  }

  const buttons = tickets.map(ticket => [
    { text: ticket.date, callback_data: ticket.date }
  ]);

  bot.sendMessage(chatId, "Hello 👋\nPlease select your travel date:", {
    reply_markup: {
      inline_keyboard: buttons
    }
  });
});

// Handle button click
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const selectedDate = query.data;

  const tickets = loadTickets();
  const ticket = tickets.find(t => t.date === selectedDate);

  if (!ticket) {
    return bot.sendMessage(chatId, "Ticket not found.");
  }

  bot.sendDocument(chatId, ticket.file_id);
  bot.answerCallbackQuery(query.id);
});

// Admin upload
bot.on("document", (msg) => {
  const chatId = msg.chat.id;

  if (chatId !== ADMIN_ID) {
    return bot.sendMessage(chatId, "You are not authorized to upload tickets.");
  }

  const file = msg.document;
  const fileName = file.file_name;

  if (!fileName.endsWith(".pdf")) {
    return bot.sendMessage(chatId, "Please upload a PDF file.");
  }

  const date = fileName.replace(".pdf", "");
  const fileId = file.file_id;

  const tickets = loadTickets();

  // Check if already exists
  const exists = tickets.find(t => t.date === date);
  if (exists) {
    return bot.sendMessage(chatId, "Ticket for this date already exists.");
  }

  tickets.push({
    date: date,
    file_id: fileId
  });

  saveTickets(tickets);

  bot.sendMessage(chatId, `Ticket "${fileName}" uploaded successfully ✅`);
});
