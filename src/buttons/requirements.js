const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const moment = require("moment");

const messages = require("../assest/messages.js");
const interface = require("../assest/interface.js");
const fieldsText = require("../assest/fieldsText.js");
const banners = require("../assest/banners.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "#requirements":
          {
            const answerButtons = new MessageActionRow().addComponents([
              new MessageButton()
                .setStyle("SECONDARY")
                .setDisabled(false)
                .setCustomId("#answer_yes")
                .setLabel("⠀I've read the requirements⠀")
                .setEmoji(emojis.check),
              new MessageButton()
                .setStyle("SECONDARY")
                .setDisabled(false)
                .setCustomId("#answer_no")
                .setLabel("⠀I havent read it yet⠀")
                .setEmoji(emojis.cross),
            ]);

            let member = guild.members.cache.get(interaction.user.id);
            if (member.roles.cache.has(config.banRole))
              return interaction.reply({
                embeds: [
                  {
                    title: `${emojis.banApp} Freezed`,
                    description: `${emojis.cross} ${messages.Banned}`,
                    color: color.gray,
                  },
                ],
                ephemeral: true,
                components: [],
              });

            const rules = new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.rules} Rules and terms`)
              .setDescription(interface.RequirementsMessage);
            //.setThumbnail(Logo)
            //.setImage(banners.requirementsBanner)

            const requirements = new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.app} In-game Requirements`)
              .setDescription("")
              //.setThumbnail(Logo)
              //.setImage(banners.requirementsBanner)
              .addFields([
                {
                  name: `${emojis.r_rank} **Required Rank**`,
                  value: fieldsText.rank,
                  inline: true,
                },
                {
                  name: `${emojis.r_level} **Required Level**`,
                  value: fieldsText.level,
                  inline: true,
                },
                {
                  name: `${emojis.alert} **Importat Note**`,
                  value: fieldsText.importantNote,
                  inline: false,
                },
              ]);

            const notes = new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.cooldown} **Cooldown**`)
              .setDescription(fieldsText.cooldownNote);
            //.setThumbnail(Logo)
            //.setImage(banners.requirementsBanner)

            const Guide = new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.guide} **User Guide**`)
              .setDescription(fieldsText.warning)
              //.setThumbnail(Logo)
              .setImage(banners.requirementsBanner)
              .setFooter({
                text: interaction.guild.name,
                iconURL: banners.parfaitIcon,
              });

            await interaction.reply({
              embeds: [rules, requirements, notes, Guide],
              ephemeral: true,
              components: [answerButtons],
            });
            console.log(
              `\x1b[0m`,
              `\x1b[31m 〢`,
              `\x1b[33m ${moment(Date.now()).format("lll")}`,
              `\x1b[34m ${interaction.user.username} READ`,
              `\x1b[35m the requirements`,
            );
          }
          break;
        default:
      }
    }
  });
};
