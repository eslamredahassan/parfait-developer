const {
  MessageActionRow,
  MessageButton,
  Modal,
  TextInputComponent,
} = require("discord.js");
const moment = require("moment");
const wait = require("util").promisify(setTimeout);
const cooldown = new Set();
require("moment-duration-format");
const banners = require("../assest/banners.js");
const errors = require("../assest/errors.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  let Logo = guild.iconURL({ dynamic: true });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "#ap_questions": {
          console.log(
            `\x1b[31m 〢`,
            `\x1b[33m ${moment(Date.now()).format("lll")}`,
            `\x1b[34m ${interaction.user.username} USED`,
            `\x1b[35m Reply Button`,
          );
          // Modal application code
          let questions = {
            q1: "Please send a screenshot from your in-game profile here",
            q2: "Tell us when you are available for a tryout by our staff",
            q3: "What are your usual days of play and hours?",
            q4: "Have you joined any clan before?",
            q5: "Where are you from?",
            q6: "When did you start playing Smash Legends?",
            q7: "Have you read the requirements?",
          };

          let applyChannel = interaction.guild.channels.cache.get(
            config.applyChannel,
          );
          if (!applyChannel) return;

          const user = interaction.user;
          const userName = user.username;

          const thread = applyChannel.threads.cache.find(
            (x) => x.name === `🧤︱${userName} Tryout`,
          );
          if (!thread) return;

          let controller = new MessageActionRow().addComponents([
            new MessageButton()
              .setStyle("SECONDARY")
              .setDisabled(true)
              .setCustomId("#thread_message_1")
              .setLabel(`Next`)
              .setEmoji(emojis.next),
          ]);

          await interaction.update({
            content: `${emojis.pinkDot} Hi ${user} We need to complete some information in your application\n${emojis.threadMarkmid} Press continue to start see the questions\n${emojis.threadMarkmid} Answer each question separately after using the reply button\n${emojis.threadMarkmid} Skipping the questions or spamming the button causes your application to be rejected\n${emojis.threadMark} Your answers most be in **English**`,
            components: [controller],
          });

          const filter = (m) => m.user.id === thread.user.id;

          for (const key in questions) {
            const question = questions[key];

            // Indicate typing before sending the question
            await thread.sendTyping();
            await wait(1500); // Simulate typing for 1.5 seconds (adjust as needed)

            await thread.send({ content: question });

            try {
              const collected = await thread.awaitMessages({
                thread: filter,
                time: 10000, // 15 Minutes
                max: 1,
                errors: ["time"],
              });

              const response = collected.first().content;

              let controller = new MessageActionRow().addComponents([
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setDisabled(false)
                  .setCustomId("#ap_questions")
                  .setLabel(`Try again`)
                  .setEmoji(emojis.next),
              ]);

              // Do something with the response if needed
            } catch (error) {
              await thread.send({
                content: "Time is Over",
                components: [controller],
              });
              break; // Exit the loop if time is over
            }
          }

          // Send a final message
          await thread.send({
            content: `Thank you, our <@&${config.staffSun}> will manage your tryout time soon`,
          });
          break;
        }
      }
    }
  });
};
