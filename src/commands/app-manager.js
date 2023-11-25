const Application = require("../../src/database/models/application");
const errors = require("../../src/assest/errors.js");
const banners = require("../assest/banners.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    let guild = client.guilds.cache.get(config.guildID);
    const perms = [`${config.devRole}`, `${config.STAFF}`];
    let staff = guild.members.cache.get(interaction.user.id);
    if (staff.roles.cache.hasAny(...perms)) {
      const { commandName, options } = interaction;

      if (commandName === "app-manager") {
        const username = options.getString("username");
        const userId = options.getString("user-id");
        const smashCode = options.getString("smash-code");
        const applicationId = options.getString("application");

        await interaction.deferReply({ ephemeral: true });
        try {
          // Construct the filter object based on the provided option
          let filter;
          if (username) {
            filter = { username };
          } else if (userId) {
            filter = { userId };
          } else if (smashCode) {
            filter = { user_code: smashCode };
          } else if (applicationId) {
            filter = { _id: applicationId }; // Assuming applicationId is the MongoDB document ID
          } else {
            // If none of the options are provided, handle accordingly
            interaction.editReply(
              "Please provide a valid option (username, user id, smash code, or application id).",
            );
            return;
          }

          const application = await Application.findOne(filter);
          if (application) {
            const app_user = interaction.guild.members.cache.get(
              application.userId,
            );
            const embed = {
              title: `${application.username}'s Application`,
              author: {
                name: application.username,
                icon_url: app_user.user.displayAvatarURL(),
              },
              color: color.gray,
              description: ` `,
              image: { url: banners.appResultBanner },
              thumbnail: { url: banners.appResultIcon },
              fields: [
                {
                  name: `${emojis.discord} Discord Profile`,
                  value: `${emojis.threadMark} ${app_user.user}` || "``N/A``",
                  inline: true,
                },
                {
                  name: `${emojis.id} Smash Code`,
                  value:
                    `${emojis.threadMark} ||${application.user_code}||` ||
                    "``N/A``",
                  inline: true,
                },
                {
                  name: `${emojis.competition} Competitions/Trainings`,
                  value:
                    `${emojis.threadMark} \`\`${application.user_ct}\`\`` ||
                    "``N/A``",
                  inline: false,
                },
                {
                  name: `${emojis.age} Age`,
                  value: `${emojis.threadMark} \`\`${
                    application.user_age
                      ? application.user_age.toString()
                      : "``N/A``"
                  }\`\``,
                  inline: false,
                },
                {
                  name: `${emojis.favorites} Favorite Legends`,
                  value:
                    `${emojis.threadMark} \`\`${application.user_legends}\`\`` ||
                    "``N/A``",
                  inline: false,
                },
                {
                  name: `${emojis.question} What can you bring to SUN ?`,
                  value:
                    `${emojis.threadMark} \`\`${application.user_why}\`\`` ||
                    "``N/A``",

                  inline: false,
                },
                {
                  name: `${emojis.time} Applied in`,
                  value:
                    `${emojis.threadMark} <t:${Math.floor(
                      application.createdIn / 1000,
                    )}:D> - <t:${Math.floor(
                      application.createdIn / 1000,
                    )}:R>` || "``N/A``",
                  inline: false,
                },
              ],
              footer: {
                text: application.userId,
                icon_url: banners.parfaitIcon,
              },
            };

            interaction.editReply({
              embeds: [embed],
              components: [],
              ephemeral: true,
            });
          } else {
            interaction.editReply(
              "No application found for the specified criteria.",
            );
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          interaction.editReply({
            content: "Error fetching data. Please try again later.",
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
  });
};
