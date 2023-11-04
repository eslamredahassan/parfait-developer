const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const moment = require("moment");
const wait = require("util").promisify(setTimeout);
const cooldown = new Set();
require("moment-duration-format");

const errors = require("../../src/assest/errors.js");
const color = require("../../src/assest/color.js");
const banners = require("../../src/assest/banners.js");
const emojis = require("../../src/assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  let Logo = guild.iconURL({ dynamic: true });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
      switch (interaction.commandName) {
        case "unfreeze":
          {
            const member = interaction.options.getUser("who");
            const reason = interaction.options.getString("reason");

            const perms = [`${config.devRole}`, `${config.STAFF}`];
            let staff = guild.members.cache.get(interaction.user.id);
            if (staff.roles.cache.hasAny(...perms)) {
              // Send Echo Message To Mentioned Room
              const memberTarget = interaction.guild.members.cache.get(
                member.id,
              );

              if (memberTarget.roles.cache.hasAny(config.banRole)) {
                await memberTarget.roles.remove(config.banRole);
                //// Send message to log channel after freezing member ///
                const log = interaction.guild.channels.cache.get(config.log);
                await log.send({
                  embeds: [
                    {
                      title: `${emojis.log} Frozen Log`,
                      description: `${emojis.snow} ${memberTarget} have been break ${interaction.user}'s snow`,
                      color: color.gray,
                      fields: [
                        {
                          name: `${emojis.reason} Freeze Reason`,
                          value: reason || `No Reason Found`,
                          inline: false,
                        },
                      ],
                      timestamp: new Date(),
                      footer: {
                        text: "Frozen in",
                        icon_url: banners.parfaitIcon,
                      },
                    },
                  ],
                  //this is the important part
                  ephemeral: false,
                });

                await interaction.reply({
                  embeds: [
                    {
                      title: `${emojis.snow} Done!`,
                      description: `Okay ${interaction.user.username} you break ${memberTarget}'s snow`,
                      color: color.gray,
                    },
                  ],
                  ephemeral: true,
                });
              } else {
                return await interaction.reply({
                  embeds: [
                    {
                      title: `${emojis.alert} Oops!`,
                      description: `No one freeze ${memberTarget} before ${emojis.tea}`,
                      color: color.gray,
                    },
                  ],
                  ephemeral: true,
                });
              }
            } else {
              await interaction.reply({
                embeds: [
                  {
                    title: `${emojis.alert} Permission denied`,
                    description: errors.permsError,
                    color: color.gray,
                  },
                ],
                //this is the important part
                ephemeral: true,
              });
              console.log(
                `\x1b[0m`,
                `\x1b[31m 🛠`,
                `\x1b[33m ${moment(Date.now()).format("lll")}`,
                `\x1b[31m Permission denied`,
              );
            }
          }
          break;
      }
    }
  });
};
