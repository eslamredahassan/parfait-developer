const { Client } = require("discord.js");
Client.setMaxListeners(0);

const config = require("./src/config");
const ready = require("./src/utils/ready");
const antiCrash = require("./src/utils/antiCrash");
const slashCommands = require("./src/utils/slashCommands");
const expired = require(`./src/events/expired.js`);
const server = require("./src/utils/server");
const logo = require("./src/assest/logo");
const moment = require("moment");

const client = new Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "DIRECT_MESSAGES",
    "MESSAGE_CONTENT",
    "DIRECT_MESSAGES",
  ],
  partials: ["CHANNEL", "MESSAGE"],
});

client.on("ready", async () => {
  server(client, config);
  antiCrash(client, config);
  ready(client, config);
  slashCommands(client, config);
  expired(client, config);

  // ------ Slash Command ------- //
  const setup_embed = require(`./src/commands/setup/setup_embed`)(
    client,
    config,
  );
  const open = require(`./src/commands/setup/open`)(client, config);
  const about = require(`./src/commands/about`)(client, config);
  const ping = require(`./src/commands/ping`)(client, config);
  const status = require(`./src/commands/status`)(client, config);
  const close = require(`./src/commands/setup/close`)(client, config);
  const maintenance = require(`./src/commands/setup/maintenance`)(
    client,
    config,
  );
  const report_bug = require(`./src/commands/report_bug`)(client, config);
  const contact_dev = require(`./src/commands/contact_dev`)(client, config);
  const echo = require(`./src/commands/echo`)(client, config);
  const freeze_command = require(`./src/commands/freeze`)(client, config);
  const unfreeze_command = require(`./src/commands/unfreeze`)(client, config);
  // -------------------------------------//

  // ------ Buttons Interactions ------- //
  const apply = require(`./src/buttons/apply`)(client, config);
  const accept = require(`./src/buttons/accept`)(client, config);
  const silent_accept = require(`./src/buttons/silent_accept`)(client, config);
  const promote = require(`./src/buttons/promote`)(client, config);
  const reject = require(`./src/buttons/reject`)(client, config);
  const silent_reject = require(`./src/buttons/silent_reject`)(client, config);
  const aplogize = require(`./src/buttons/apologize`)(client, config);
  const freeze = require(`./src/buttons/freeze`)(client, config);
  const requirements = require(`./src/buttons/requirements`)(client, config);
  const answer_yes = require(`./src/buttons/answer_yes`)(client, config);
  const answer_no = require(`./src/buttons/answer_no`)(client, config);
  const reply = require(`./src/buttons/reply`)(client, config);
  // -------------------------------------//

  // ------------ Select Menu ------------ //
  const about_menu = require(`./src/select menu/about_menu`)(client, config);
  const faq_menu = require(`./src/select menu/faq_menu`)(client, config);
  // -------------------------------------//

  // ------------ Interactions ------------ //
  const questions = require(`./src/interaction/questions`)(client, config);
  // -------------------------------------//

  console.log(
    `\x1b[31m  〢`,
    `\x1b[33m ${moment(Date.now()).format("LT")}`,
    `\x1b[31m ${client.user.tag}`,
    `\x1b[32m ONLINE`,
  );

  console.log(
    `\x1b[31m  〢`,
    `\x1b[33m ${moment(Date.now()).format("LT")}`,
    `\x1b[31m SUN™&Co Smash Legends`,
    `\x1b[32m CHECKED`,
  );
});

client.login(config.token);
