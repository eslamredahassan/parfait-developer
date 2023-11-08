const { Client, Intents } = require("discord.js");
const fs = require("fs");
const path = require("path");
Client.setMaxListeners(0);

const config = require("./src/config");
const ready = require("./src/utils/ready");
const connect = require("./src/database/connect");
const antiCrash = require("./src/utils/antiCrash");
const deployCommands = require("./src/utils/deployCommands");
const expired = require(`./src/events/expired.js`);
const app_guard = require(`./src/events/app_guard.js`);
const stickyRole = require(`./src/events/stickyRole.js`);
const reminder = require(`./src/events/reminder.js`);
const server = require("./src/utils/server");
const logo = require("./src/assest/logo");
const moment = require("moment");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.MESSAGE_CONTENT,
  ],
  partials: ["CHANNEL", "MESSAGE", "GUILD_MEMBER"],
});

client.on("ready", async () => {
  server(client, config);
  antiCrash(client, config);
  ready(client, config);
  deployCommands(client, config);
  connect(client, config);
  expired(client, config);
  stickyRole(client, config);
  reminder(client, config);
  app_guard(client, config);

  // The directory where your slash command files are stored
  const loadCommands = (directory) => {
    fs.readdirSync(directory).forEach((file) => {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        loadCommands(fullPath); // Recursively load commands in subdirectories
      } else if (file.endsWith(".js")) {
        const command = require(fullPath);
        command(client, config);
      }
    });
  };

  const commandsDirectory = path.join(__dirname, "src/commands");
  loadCommands(commandsDirectory);
  // The directory where your buttons files are stored
  const buttonsDirectory = path.join(__dirname, "src/buttons");
  fs.readdir(buttonsDirectory, (error, files) => {
    if (error) {
      console.error("Error reading buttons directory:", error.message);
      return;
    }
    files.forEach((file) => {
      if (file.endsWith(".js")) {
        const buttonPath = path.join(buttonsDirectory, file);
        const button = require(buttonPath);
        button(client, config);
      }
    });
  });
  // The directory where your select menu files are stored
  const selectMenuDirectory = path.join(__dirname, "src/select menu");
  // Read all files in the directory
  fs.readdir(selectMenuDirectory, (error, files) => {
    if (error) {
      console.error("Error reading select menu directory:", error.message);
      return;
    }
    files.forEach((file) => {
      if (file.endsWith(".js")) {
        const selectMenuPath = path.join(selectMenuDirectory, file);
        const selectMenu = require(selectMenuPath);
        selectMenu(client, config);
      }
    });
  });

  // ------------ Interactions ------------ //
  const questions = require(`./src/interaction/questions`)(client, config);
  // -------------------------------------//

  console.log(
    `\x1b[0m`,
    `\x1b[33m ├`,
    `\x1b[33m ${moment(Date.now()).format("LT")}`,
    `\x1b[31m ${client.user.tag}`,
    `\x1b[32m ONLINE`,
  );

  console.log(
    `\x1b[0m`,
    `\x1b[33m ├`,
    `\x1b[33m ${moment(Date.now()).format("LT")}`,
    `\x1b[31m SUN™&Co Smash Legends`,
    `\x1b[32m CHECKED`,
  );
});

client.login(config.token).catch((error) => ("Error:", error.message));
