const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const messages = require("../assest/messages.js");
const fieldsText = require("../assest/fieldsText.js");
const banners = require("../assest/banners.js");
const errors = require("../assest/errors.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");
const moment = require("moment");
const wait = require("util").promisify(setTimeout);
const cooldown = new Set();
require("moment-duration-format");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "#ap_accept":
          {
            const perms = [`${config.devRole}`, `${config.STAFF}`];
            let staff = guild.members.cache.get(interaction.user.id);
            if (staff.roles.cache.hasAny(...perms)) {
              const ID = interaction.message.embeds[0].footer.text;
              const ap_user = await interaction.guild.members.fetch(ID);

              const smashCode = await interaction.message.embeds[0].fields.find(
                (f) => f.name === `${emojis.id} Smash Code`,
              ).value;

              const recruitmentChannel = interaction.guild.channels.cache.get(
                config.recruitmentChannel,
              );
              const announces = interaction.guild.channels.cache.get(
                config.announcesChannel,
              );

              let promote = new MessageActionRow().addComponents([
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setDisabled(false)
                  .setCustomId("#ap_promote")
                  .setLabel(`Promote ${ap_user.user.username}`)
                  .setEmoji(emojis.promote),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setDisabled(false)
                  .setCustomId("#ap_apologize")
                  .setLabel(`Apologize`)
                  .setEmoji(emojis.apologize),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setDisabled(false)
                  .setCustomId("#ap_reply")
                  .setLabel(``)
                  .setEmoji(emojis.dm),
              ]);

              let embed = new MessageEmbed(interaction.message.embeds[0])
                .setTitle(`${emojis.alert} Accepted by ${interaction.user.tag}`)
                .setColor(color.gray)
                .setImage(banners.acceptFinishbanner)
                .setThumbnail(banners.acceptIcon)
                .setTimestamp();

              await interaction.message.edit({
                embeds: [embed],
                components: [promote],
              });

              console.log(
                `\x1b[0m`,
                `\x1b[33m 〢`,
                `\x1b[30m ${moment(Date.now()).format("lll")}`,
                `\x1b[34m ${ap_user.user.username}`,
                `\x1b[32m ACCEPTED BY ${interaction.user.username}`,
              );

              await ap_user.send({
                embeds: [
                  new MessageEmbed()
                    .setColor(color.gray)
                    .setTitle(`${emojis.s_parfait} Welcome in SUN Clan`)
                    .setImage(banners.acceptBanner)
                    .setDescription(messages.acceptMessage)
                    .addFields([
                      {
                        name: `${emojis.apply} Clan Code`,
                        value: fieldsText.clanCode,
                        inline: false,
                      },
                      {
                        name: `${emojis.alert} Most Important Rules`,
                        value: fieldsText.dmWarning,
                        inline: false,
                      },
                    ]),
                ],
                components: [],
              });
              //// Send message after accepting member ///
              await interaction
                .reply({
                  embeds: [
                    {
                      title: `${emojis.check} Acceptance Alert`,
                      description: `${emojis.threadMarkmid} You accepted ${ap_user} in **${interaction.guild.name}**\n${emojis.threadMark} His thread will be automatically archived in \`\`20 Seconds\`\``,
                      color: color.gray,
                    },
                  ],
                  //this is the important part
                  ephemeral: true,
                })
                .catch((err) => console.log("Error Line 115"));

              const log = interaction.guild.channels.cache.get(config.log);
              await log.send({
                embeds: [
                  {
                    title: `${emojis.log} Accept Log`,
                    description: `${emojis.check} ${ap_user.user} have been accepted by ${interaction.user}`,
                    color: color.gray,
                    timestamp: new Date(),
                    footer: {
                      text: "Accepted in",
                      icon_url: banners.parfaitIcon,
                    },
                  },
                ],
                //this is the important part
                ephemeral: false,
              });
              //// Interactions roles ///
              await ap_user.roles
                .add([config.SunTest, config.SquadSUN])
                .catch(() => console.log("Error Line 2159"));
              console.log(
                `\x1b[0m`,
                `\x1b[33m 🛠`,
                `\x1b[33m ${moment(Date.now()).format("lll")}`,
                `\x1b[33m Sun Roles ADDED`,
              );
              await ap_user.roles
                .remove(config.waitRole)
                .catch(() => console.log("Error Line 2171"));
              console.log(
                `\x1b[0m`,
                `\x1b[36m 🛠`,
                `\x1b[33m ${moment(Date.now()).format("lll")}`,
                `\x1b[33m Waitlist role REMOVED`,
              );

              const msg_one = await recruitmentChannel.send(
                `<:SPice:1080958776351399976> Welcome ${ap_user} in **SUN** :partying_face:`,
              );
              const msg_two = await announces.send(
                `${emojis.pinkDot} Welcome ${ap_user} in **SUN** <@&${config.SquadSUN}> :partying_face:\n${smashCode}`,
              );

              var Emojis = [emojis.s_parfait, emojis.f_parfait];
              for (var i = 0; i < Emojis.length; i++) {
                var React = Emojis[i];

                try {
                  await msg_one.react(React);
                  await msg_two.react(React);
                } catch (err) {
                  console.log(
                    `\x1b[0m`,
                    `\x1b[31m 〢`,
                    `\x1b[30m ${moment(Date.now()).format("lll")}`,
                    `\x1b[34m${interaction.user.username} Error`,
                    `\x1b[35m Sending emojis!`,
                  );
                  throw err;
                }
              }

              let applyChannel = interaction.guild.channels.cache.get(
                config.applyChannel,
              );
              if (!applyChannel) return;

              const user = ap_user.user;
              const userName = user.username;

              const threadName = applyChannel.threads.cache.find(
                (x) => x.name === `${"🧤︱" + userName + " Tryout"}`,
              );
              /// Rename The Thread ///
              await threadName.setName("🧤︱" + `${userName}` + " Accepted");
              /// Lock the thread ///
              await wait(5000); // ** cooldown 10 seconds ** \\
              await threadName.setLocked(true);
              /// Archive the thread ///
              await wait(8000); // ** cooldown 10 seconds ** \\
              await threadName.setArchived(true);
            } else {
              await interaction
                .reply({
                  embeds: [
                    {
                      title: `${emojis.alert} Permission denied`,
                      description: errors.permsError,
                      color: color.gray,
                    },
                  ],
                  //this is the important part
                  ephemeral: true,
                })
                .catch(() => console.log("Error Line 2209"));
              console.log(
                `\x1b[0m`,
                `\x1b[31m 🛠`,
                `\x1b[30m ${moment(Date.now()).format("lll")}`,
                `\x1b[33m Permission denied`,
              );
            }
          }
          break;
        default:
      }
    }
  });
};
