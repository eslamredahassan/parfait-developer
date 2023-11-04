const {
  MessageActionRow,
  MessageSelectMenu,
  MessageButton,
} = require("discord.js");

const wait = require("util").promisify(setTimeout);
const moment = require("moment");
require("moment-duration-format");

const banners = require("../assest/banners.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton() && !interaction.isSelectMenu()) {
      switch (interaction.customId) {
        case "#answer_yes":
          {
            console.log(
              `\x1b[31m  〢`,
              `\x1b[33m ${moment(Date.now()).format("lll")}`,
              `\x1b[34m ${interaction.user.username} ANSWERED`,
              `\x1b[35m Yes`,
            );
            const languges = new MessageActionRow().addComponents(
              new MessageSelectMenu()
                .setCustomId("#answer_yes_menu")
                .setPlaceholder(
                  "Choose your language and your region from here",
                )
                .addOptions([
                  {
                    label: "[EU] English",
                    value: "#en_eu",
                    description: `Choose this if you're european player`,
                    emoji: emojis.eu,
                  },
                  {
                    label: "[NA] English",
                    value: "#en_na",
                    description: `Choose this if you're north american player`,
                    emoji: emojis.na,
                  },
                  {
                    label: "French",
                    value: "#french",
                    description: `French people are european by default 👽`,
                    emoji: emojis.fr,
                  },
                ]),
            ); // End of .addComponents()
            await interaction.update({
              embeds: [
                {
                  title: `Languages and your regions`,
                  description: `- This will give you access to specific rooms based on your region`,
                  image: { url: banners.langBanner },
                  color: color.gray,
                },
              ],
              //this is the important part
              ephemeral: true,
              components: [languges],
            });
            client.on("interactionCreate", async (interaction) => {
              if (interaction.isSelectMenu("#answer_yes_menu")) {
                let langChoice = interaction.values[0];
                if (langChoice == "#en_eu") {
                  let applyButton = new MessageActionRow().addComponents([
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setDisabled(false)
                      .setCustomId("#ap_apply")
                      .setLabel("Become a Sun Legend")
                      .setEmoji(emojis.apply),
                  ]);

                  console.log(
                    `\x1b[31m  〢`,
                    `\x1b[33m ${moment(Date.now()).format("lll")}`,
                    `\x1b[34m ${interaction.user.username} CHOOSED`,
                    `\x1b[35m English Europ`,
                  );

                  try {
                    await interaction.member.roles.add(config.en_eu);
                  } catch (error) {
                    console.log(error.message);
                  }

                  return await interaction.update({
                    embeds: [
                      {
                        title: `You're now ready to apply`,
                        description: `Press **Become a Sun Legend** and then fill out your application`,
                        image: { url: banners.readyBanner },
                        color: color.gray,
                      },
                    ],
                    //this is the important part
                    ephemeral: true,
                    components: [applyButton],
                  });
                } else if (langChoice == "#en_na") {
                  console.log(
                    `\x1b[31m  〢`,
                    `\x1b[33m ${moment(Date.now()).format("lll")}`,
                    `\x1b[34m ${interaction.user.username} CHOOSED`,
                    `\x1b[35m English NA`,
                  );

                  const applyButton = new MessageActionRow().addComponents([
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setDisabled(true)
                      .setCustomId("#ap_apply")
                      .setLabel("Become a Sun Legend")
                      .setEmoji(emojis.apply),
                  ]);

                  try {
                    await interaction.member.roles.add(config.en_na);
                  } catch (error) {
                    console.log(error.message);
                  }

                  return await interaction.update({
                    embeds: [
                      {
                        title: `Unfortunately`,
                        description: `- Unfortunately, only European players are allowed to apply for now\n- Anyway, you've got <@&${config.en_na}> role\n - You'll know we open the recruitment for North American players`,
                        image: { url: banners.sorryBanner },
                        color: color.gray,
                      },
                    ],
                    //this is the important part
                    ephemeral: true,
                    components: [],
                  });
                } else if (langChoice == "#french") {
                  console.log(
                    `\x1b[31m  〢`,
                    `\x1b[33m ${moment(Date.now()).format("lll")}`,
                    `\x1b[34m ${interaction.user.username} CHOOSED`,
                    `\x1b[35m French`,
                  );

                  const applyButton = new MessageActionRow().addComponents([
                    new MessageButton()
                      .setStyle("SECONDARY")
                      .setDisabled(false)
                      .setCustomId("#ap_apply")
                      .setLabel("Become a Sun Legend")
                      .setEmoji(emojis.apply),
                  ]);

                  try {
                    await interaction.member.roles.add(config.fr);
                  } catch (error) {
                    console.log(error.message);
                  }

                  return await interaction.update({
                    embeds: [
                      {
                        title: `You're now ready to apply`,
                        description: `Press **Become a Sun Legend** and then fill out your application`,
                        image: { url: banners.readyBanner },
                        color: color.gray,
                      },
                    ],
                    //this is the important part
                    ephemeral: true,
                    components: [applyButton],
                  });
                }
              }
            });
          }
          break;
      }
    }
  });
};
