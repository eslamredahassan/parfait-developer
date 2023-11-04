const TemporaryRole = require("../../src/database/models/TemporaryRoleModel");

const banners = require("../assest/banners.js");
const errors = require("../assest/errors.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
      switch (interaction.commandName) {
        case "duration": {
          const guild = interaction.guild;
          const member = guild.members.cache.get(interaction.user.id);

          await interaction.deferReply({ ephemeral: true });

          try {
            const temporaryRole = await TemporaryRole.findOne({
              userId: member.id,
            });
            if (!temporaryRole) {
              await interaction.reply("You do not have a temporary role.");
              return;
            }

            const roleExpiry = temporaryRole.expiry;
            const currentTime = new Date();
            const timeDifference = roleExpiry.getTime() - currentTime.getTime();

            if (timeDifference <= 0) {
              await interaction.editReply({
                embeds: [
                  {
                    title: `Cooldown period`,
                    description: `- Your temporary role has expired.`,
                    //image: { url: banners.langBanner },
                    color: color.gray,
                  },
                ],
                //this is the important part
                ephemeral: true,
                components: [],
              });
              return;
            }

            const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const hoursLeft = Math.floor(
              (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            const minutesLeft = Math.floor(
              (timeDifference % (1000 * 60 * 60)) / (1000 * 60),
            );

            const timeLeftString = `${daysLeft} days, ${hoursLeft} hours, and ${minutesLeft} minutes`;

            await interaction.editReply({
              embeds: [
                {
                  title: `Your cooldown period will end in`,
                  description: `- **${timeLeftString}**`,
                  //image: { url: banners.langBanner },
                  color: color.gray,
                },
              ],
              //this is the important part
              ephemeral: true,
              components: [],
            });
          } catch (error) {
            console.error("Error checking time left for role:", error.message);
            await interaction.reply({
              embeds: [
                {
                  title: `Cooldown period`,
                  description: `An error occurred while checking the time for your role.`,
                  //image: { url: banners.langBanner },
                  color: color.gray,
                },
              ],
              //this is the important part
              ephemeral: true,
              components: [],
            });
          }
        }
      }
    }
  });
};
