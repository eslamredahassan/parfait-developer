const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const moment = require("moment");
const wait = require("util").promisify(setTimeout);
const cooldown = new Set();
require("moment-duration-format");

const TemporaryRole = require("../../src/database/models/TemporaryRoleModel");
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
        case "freeze":
          {
            const member = interaction.options.getUser("who");
            const reason = interaction.options.getString("reason");
            const durationInDays = interaction.options.getInteger("duration");

            await interaction.deferReply({ ephemeral: true });

            const perms = [`${config.devRole}`, `${config.devRoleTest}`];
            let staff = guild.members.cache.get(interaction.user.id);
            if (staff.roles.cache.hasAny(...perms)) {
              // Send Echo Message To Mentioned Room
              const memberTarget = interaction.guild.members.cache.get(
                member.id,
              );

              if (!memberTarget.roles.cache.hasAny(config.banRole)) {
                try {
                  const expiryDate = new Date();
                  expiryDate.setDate(expiryDate.getDate() + durationInDays);

                  if (!memberTarget) {
                    await interaction.reply("Member not found.");
                    return;
                  }

                  await memberTarget.roles.add(config.banRole);
                  await TemporaryRole.create({
                    userId: memberTarget.id,
                    roleId: config.banRole,
                    expiry: expiryDate,
                  });

                  await interaction.editReply({
                    content: `Okay ${interaction.user.username} you frozen ${memberTarget} for ${durationInDays} days.`,
                    ephemeral: true,
                  });
                } catch (error) {
                  console.error("Error giving temporary role:", error);
                  await interaction.editReply({
                    content:
                      "An error occurred while giving the temporary role.",
                    ephemeral: true,
                  });
                }
                //// Send message to log channel after freezing member ///
                const log = interaction.guild.channels.cache.get(config.log);
                await log.send({
                  embeds: [
                    {
                      title: `${emojis.log} Frozen Log`,
                      description: `${emojis.snow} ${memberTarget} have been frozen by ${interaction.user}`,
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
                        text: "Freezed in",
                        icon_url: banners.parfaitIcon,
                      },
                    },
                  ],
                  //this is the important part
                  ephemeral: false,
                });

                await interaction.editReply({
                  embeds: [
                    {
                      title: `${emojis.snow} Done!`,
                      description: `Okay ${interaction.user.username} you frozen ${memberTarget} now`,
                      color: color.gray,
                    },
                  ],
                  ephemeral: true,
                });
              } else {
                return await interaction.editReply({
                  embeds: [
                    {
                      title: `${emojis.alert} Oops!`,
                      description: `${memberTarget} already frozen, we don't want to kill him ${emojis.tea}`,
                      color: color.gray,
                    },
                  ],
                  ephemeral: true,
                });
              }
            } else {
              await interaction.editReply({
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
