const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs-extra");
const path = require("path");

const token = process.env.BOT_TOKEN;
const ADMIN_ID = 1064327506;

const bot = new TelegramBot(token, { polling: true });

const ticketsFile = "./tickets.json";
const ticketsFolder = "./tickets";

let userStates = {};

// Load tickets
function loadTickets() {
  return fs.readJsonSync(ticketsFile);
}

// Save tickets
function saveTickets(data) {
  fs.writeJsonSync(ticketsFile, data, { spaces: 2 });
}

// Generate keyboard
function generateKeyboard() {
  const tickets = loadTickets();
  return Object.keys(tickets).map(name => [
    { text: name, callback_data: name }
  ]);
}

// START COMMAND
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Hello 👋\nPlease select your travel date:",
    {
      reply_markup: {
        inline_keyboard: generateKeyboard()
      }
    }
  );
});

// ADMIN ADD COMMAND
bot.onText(/\/add/, (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) {
    return bot.sendMessage(msg.chat.id, "❌ Not authorized.");
  }

  userStates[msg.from.id] = { step: "waiting_pdf" };
  bot.sendMessage(msg.chat.id, "📎 Send the PDF file.");
});

// HANDLE DOCUMENT
bot.on("document", async (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;

  if (userStates[msg.from.id]?.step === "waiting_pdf") {
    const fileId = msg.document.file_id;
    const fileName = msg.document.file_name;
    const filePath = await bot.getFileLink(fileId);

    const downloadPath = path.join(ticketsFolder, fileName);

    await fs.ensureDir(ticketsFolder);
    await fs.writeFile(downloadPath, await (await fetch(filePath)).buffer());

    userStates[msg.from.id] = {
      step: "waiting_name",
      fileName: fileName
    };

    bot.sendMessage(msg.chat.id, "📝 Enter ticket name (example: 30 April 2026)");
  }
});

// HANDLE TICKET NAME
bot.on("message", (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;

  if (userStates[msg.from.id]?.step === "waiting_name") {
    const tickets = loadTickets();
    tickets[msg.text] = userStates[msg.from.id].fileName;
    saveTickets(tickets);

    userStates[msg.from.id] = null;

    bot.sendMessage(msg.chat.id, "✅ Ticket added successfully!");
  }
});

// HANDLE BUTTON CLICK
bot.on("callback_query", (query) => {
  const tickets = loadTickets();
  const fileName = tickets[query.data];

  if (fileName) {
    bot.sendDocument(query.message.chat.id, path.join(ticketsFolder, fileName));
  }

  bot.answerCallbackQuery(query.id);
});

console.log("Bot running...");