const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// Bot token
const token = process.env.BOT_TOKEN;
const ADMIN_ID = 1064327506; // Replace with your Telegram ID

// Create a new bot instance
const bot = new TelegramBot(token, { polling: true });

console.log("Bot is running...");

// ---------------- Load Tickets ----------------

const ticketsFolder = path.join(__dirname, "tickets");

// Ensure tickets folder exists
if (!fs.existsSync(ticketsFolder)) {
  fs.mkdirSync(ticketsFolder);
}

// Load tickets from JSON file
function loadTickets() {
  const ticketsFile = path.join(__dirname, 'tickets.json');

  // If tickets.json doesn't exist, create it with empty array
  if (!fs.existsSync(ticketsFile)) {
    fs.writeFileSync(ticketsFile, JSON.stringify([]));
  }

  return JSON.parse(fs.readFileSync(ticketsFile));
}

// ---------------- /start Command ----------------

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const tickets = loadTickets();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validTickets = tickets.filter(ticket => {
    const ticketDate = new Date(ticket.date);
    return ticketDate >= today;
  });

  if (validTickets.length === 0) {
    return bot.sendMessage(chatId, "No tickets available right now.");
  }

  const buttons = validTickets
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(ticket => [
      { text: ticket.date, callback_data: ticket.date }
    ]);

  // Add Download All button
  buttons.push([
    { text: "📥 Download All Tickets", callback_data: "download_all" }
  ]);

  bot.sendMessage(chatId, "Hello 👋\nPlease select your travel date:", {
    reply_markup: { inline_keyboard: buttons }
  });
});

// ---------------- Handle Callback Query ----------------

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "download_all") {
    const tickets = loadTickets();

    tickets.forEach(ticket => {
      bot.sendDocument(chatId, ticket.file_id);
    });

    return bot.answerCallbackQuery(query.id);
  }

  const ticket = loadTickets().find(t => t.date === data);

  if (!ticket) {
    return bot.sendMessage(chatId, "Ticket not found.");
  }

  bot.sendDocument(chatId, ticket.file_id);
  bot.answerCallbackQuery(query.id);
});

// ---------------- Admin File Upload ----------------

bot.on('document', (msg) => {
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

  const tickets = loadTickets();

  const existing = tickets.find(t => t.date === date);
  if (existing) {
    return bot.sendMessage(chatId, "Ticket for this date already exists.");
  }

  // Save ticket to JSON file
  tickets.push({
    date: date,
    file_id: file.file_id
  });

  const ticketsFile = path.join(__dirname, 'tickets.json');
  fs.writeFileSync(ticketsFile, JSON.stringify(tickets, null, 2));

  bot.sendMessage(chatId, `Ticket "${fileName}" uploaded successfully ✅`);
});

// ---------------- Reply to Any User Message ----------------

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  if (msg.text && !msg.text.startsWith("/") && !msg.document) {
    bot.sendMessage(
      chatId,
      "Hello 👋\nWelcome to Ticket Counter Bot.\n\nType /start to view available tickets."
    );
  }
});

console.log("Bot is running...");
// Create a new bot instance
const bot = new TelegramBot(token, { polling: true });

console.log("Bot is running...");

// ---------------- Load Tickets ----------------

const ticketsFolder = path.join(__dirname, "tickets");

// Ensure tickets folder exists
if (!fs.existsSync(ticketsFolder)) {
  fs.mkdirSync(ticketsFolder);
}

// Load tickets from JSON file
function loadTickets() {
  const ticketsFile = path.join(__dirname, 'tickets.json');

  // If tickets.json doesn't exist, create it with empty array
  if (!fs.existsSync(ticketsFile)) {
    fs.writeFileSync(ticketsFile, JSON.stringify([]));
  }

  return JSON.parse(fs.readFileSync(ticketsFile));
}

// ---------------- /start Command ----------------

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const tickets = loadTickets();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validTickets = tickets.filter(ticket => {
    const ticketDate = new Date(ticket.date);
    return ticketDate >= today;
  });

  if (validTickets.length === 0) {
    return bot.sendMessage(chatId, "No upcoming train tickets available right now.");
  }

  const buttons = validTickets
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(ticket => [
      { text: ticket.date, callback_data: ticket.date }
    ]);

  // Add Download All button
  buttons.push([
    { text: "📥 Download All Train Tickets", callback_data: "download_all" }
  ]);

  bot.sendMessage(chatId, "Hello 👋\nPlease select your travel date:", {
    reply_markup: { inline_keyboard: buttons }
  });
});

// ---------------- Handle Callback Query ----------------

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "download_all") {
    const tickets = loadTickets();

    tickets.forEach(ticket => {
      bot.sendDocument(chatId, ticket.file_id);
    });

    return bot.answerCallbackQuery(query.id);
  }

  const ticket = loadTickets().find(t => t.date === data);

  if (!ticket) {
    return bot.sendMessage(chatId, "Ticket not found.");
  }

  bot.sendDocument(chatId, ticket.file_id);
  bot.answerCallbackQuery(query.id);
});

// ---------------- Admin File Upload ----------------

bot.on('document', (msg) => {
  const chatId = msg.chat.id;

  if (chatId !== ADMIN_ID) {
    return bot.sendMessage(chatId, "You are not authorized to upload train tickets.");
  }

  const file = msg.document;
  const fileName = file.file_name;

  if (!fileName.endsWith(".pdf")) {
    return bot.sendMessage(chatId, "Please upload a PDF train ticket.");
  }

  const date = fileName.replace(".pdf", "");

  const tickets = loadTickets();

  const existing = tickets.find(t => t.date === date);
  if (existing) {
    return bot.sendMessage(chatId, "Ticket for this date already exists.");
  }

  // Save ticket to JSON file
  tickets.push({
    date: date,
    file_id: file.file_id
  });

  const ticketsFile = path.join(__dirname, 'tickets.json');
  fs.writeFileSync(ticketsFile, JSON.stringify(tickets, null, 2));

  bot.sendMessage(chatId, `Train ticket for "${fileName}" uploaded successfully ✅`);
});

// ---------------- Reply to Any User Message ----------------

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userFirstName = msg.from.first_name; // Get user first name
  const currentHour = new Date().getHours();

  // Time-based greeting
  let greeting = "Hello 👋";
  if (currentHour < 12) {
    greeting = `Good Morning, ${userFirstName}! 🌅`;
  } else if (currentHour < 18) {
    greeting = `Good Afternoon, ${userFirstName}! 🌞`;
  } else {
    greeting = `Good Evening, ${userFirstName}! 🌙`;
  }

  // If the message is random (not a command)
  if (msg.text && !msg.text.startsWith("/") && !msg.document) {
    const randomMessages = [
      `${greeting} I'm your personal Train Ticket Bot! 🎟️ What date are you traveling? 🚆`,
      `${greeting} Need a train ticket? 🚅 Just type the date and I'll send it! 🎟️`,
      `${greeting} Type /start to check your upcoming train tickets! 🚉`,
      "Need your train ticket? 🚆 Just let me know and I'll send it to you! 🎫",
      "Hey! 🌟 Ready to get your train tickets? 🎟️ Select the date and I’ll send it right away! 🚆",
    ];

    // Randomly pick a greeting message
    const message = randomMessages[Math.floor(Math.random() * randomMessages.length)];

    // Send the chosen message
    bot.sendMessage(chatId, message);
  }
});

console.log("Bot is running...");
