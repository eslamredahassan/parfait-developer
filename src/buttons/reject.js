const {
  MessageActionRow,
  MessageEmbed,
  Modal,
  TextInputComponent,
} = require("discord.js");

const moment = require("moment");
const wait = require("util").promisify(setTimeout);

const TemporaryRole = require("../../src/database/models/TemporaryRoleModel");
const messages = require("../assest/messages.js");
const banners = require("../assest/banners.js");
const errors = require("../assest/errors.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "#ap_reject": {
          const ID = interaction.message.embeds[0].footer.text;
          const user = await interaction.guild.members.fetch(ID);

          //// Modal application code ///
          let reply_modal = new Modal()
            .setTitle(`Rejection reason of ${user.user.username}`)
            .setCustomId(`ap_reject`);

          const ap_reason = new TextInputComponent()
            .setCustomId("ap_reason")
            .setLabel(`Direct Messaging box`.substring(0, 45))
            .setMinLength(1)
            .setMaxLength(365)
            .setRequired(false)
            .setPlaceholder(`Type your message here`)
            .setStyle(2);

          let row_reply = new MessageActionRow().addComponents(ap_reason);
          reply_modal.addComponents(row_reply);

          const perms = [`${config.devRole}`, `${config.STAFF}`];
          let staff = guild.members.cache.get(interaction.user.id);
          if (staff.roles.cache.hasAny(...perms)) {
            await interaction.showModal(reply_modal);
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
              `\x1b[33m Permission denied`,
            );
          }
        }
        default:
          break;
      }
    }
    //// Send application results in review room ////
    if (interaction.customId === "ap_reject") {
      let reply = interaction.fields.getTextInputValue("ap_reason");

      /// Embed of data in review room ///
      let embed = new MessageEmbed(interaction.message.embeds[0])
        .setTitle(`${emojis.alert} Rejected by ${interaction.user.username}`)
        .setColor(color.gray)
        .setImage(banners.rejectBanner)
        .setThumbnail(banners.rejectIcon)
        .setTimestamp();
      /// Edit Review Embed ///
      interaction.message
        .edit({
          embeds: [embed],
          components: [],
        })
        .then((msg) => msg.unpin());

      //// Send message to rejected member ///
      const ID = interaction.message.embeds[0].footer.text;
      const ap_user = await interaction.guild.members.fetch(ID);

      const expiryInMinutes = 60; // Example: role expires in 60 minutes

      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + expiryInMinutes);

      const temporaryRole = new TemporaryRole({
        userId: ap_user.id,
        guildId: guild.id,
        roleId: config.coolDown,
        expiry: expiryDate,
      });

      try {
        await temporaryRole.save(); // Save the temporary role data to the database

        // Assign the role to the member
        await ap_user.roles.remove(config.waitRole);
        await ap_user.roles.add(config.coolDown);
      } catch (err) {
        console.error("Error assigning temporary role:", err);
      }
      try {
        await ap_user.send({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.sad_parfait} Sorry mate`)
              .setImage(banners.dmRejectBanner)
              .setDescription(reply || messages.reject),
          ],
        });
      } catch (e) {
        return await interaction.reply({
          content: `The ${user} Dms Were Closed.`,
          ephemeral: true,
        });
      }
      //// Send reply message after rejecting member ///
      await interaction.reply({
        embeds: [
          {
            title: `${emojis.cross} Rejection Alert`,
            description: `${emojis.threadMarkmid} You rejected ${ap_user.user} from joining **${interaction.guild.name}**\n${emojis.threadMarkmid} Removed his application from pin list\n${emojis.threadMark} His thread will be automatically archived in \`\`20 Seconds\`\``,
            color: color.gray,
          },
        ],
        //this is the important part
        ephemeral: true,
      });
      /// Console Action ///
      console.log(
        `\x1b[0m`,
        `\x1b[31m 〢`,
        `\x1b[33m ${moment(Date.now()).format("lll")}`,
        `\x1b[34m ${ap_user.user.username}`,
        `\x1b[32m REJECTED BY ${interaction.user.username}`,
      );
      //// Send message to log channel after rejecting member ///
      const log = interaction.guild.channels.cache.get(config.log);
      await log.send({
        embeds: [
          {
            title: `${emojis.log} Rejection Log`,
            description: `${emojis.cross} ${ap_user.user} have been rejected by ${interaction.user}`,
            color: color.gray,
            fields: [
              {
                name: `${emojis.reason} Rejection Reason`,
                value: reply || `No Reason Found`,
                inline: false,
              },
            ],
            timestamp: new Date(),
            footer: {
              text: "Rejected in",
              icon_url: banners.parfaitIcon,
            },
          },
        ],
        //this is the important part
        ephemeral: false,
      });

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
      await threadName.setName("🧤︱" + `${userName}` + " Rejected");
      /// Lock the thread ///
      await wait(5000); // ** cooldown 10 seconds ** \\
      await threadName.setLocked(true);
      /// Archive the thread ///
      await wait(8000); // ** cooldown 10 seconds ** \\
      await threadName.setArchived(true);
    }
  });
};
