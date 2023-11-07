const {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageAttachment,
} = require("discord.js");
const { createCanvas, loadImage, registerFont } = require("canvas");

const messages = require("../assest/messages.js");
const fieldsText = require("../assest/fieldsText.js");
const banners = require("../assest/banners.js");
const errors = require("../assest/errors.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");
const Application = require("../../src/database/models/application");
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
            await interaction.deferReply({ ephemeral: true });

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
              var Emojis = [emojis.s_parfait, emojis.f_parfait];
              for (var i = 0; i < Emojis.length; i++) {
                var React = Emojis[i];

                await msg_one.react(React);
              }
              registerFont("./src/assest/fonts/BebasNeue-Regular.otf", {
                family: "BebasNeue Regular",
              });
              registerFont("./src/assest/fonts/venusRisingRG.otf", {
                family: "Venus Rising",
              });
              const applicationData = await Application.findOne({
                userId: ap_user.id,
              });
              const userCode = applicationData.user_code; // Adjust field name as per your database schem

              const legendImages = [
                "./src/assest/images/legends/parfait.png",
                "./src/assest/images/legends/ali.png",
                "./src/assest/images/legends/timun.png",
                "./src/assest/images/legends/aoi.png",
                "./src/assest/images/legends/robin.png",
                "./src/assest/images/legends/zeppetta.png",
                "./src/assest/images/legends/rapunzel.png",
                "./src/assest/images/legends/alice.png",
                "./src/assest/images/legends/brick.png",
                "./src/assest/images/legends/cat.png",
                "./src/assest/images/legends/cindy.png",
                "./src/assest/images/legends/donq.png",
                "./src/assest/images/legends/ducky.png",
                "./src/assest/images/legends/flare.png",
                "./src/assest/images/legends/goldie.png",
                "./src/assest/images/legends/gumi.png",
                "./src/assest/images/legends/hook.png",
                "./src/assest/images/legends/jacko.png",
                "./src/assest/images/legends/kaiser.png",
                "./src/assest/images/legends/Kurenai.png",
                "./src/assest/images/legends/loren.png",
                "./src/assest/images/legends/maya.png",
                "./src/assest/images/legends/molly.png",
                "./src/assest/images/legends/nui.png",
                "./src/assest/images/legends/octavia.png",
                "./src/assest/images/legends/peter.png",
                "./src/assest/images/legends/queen.png",
                "./src/assest/images/legends/rambert.png",
                "./src/assest/images/legends/ravi.png",
                "./src/assest/images/legends/red.png",
                "./src/assest/images/legends/snow.png",
                "./src/assest/images/legends/victor.png",
                "./src/assest/images/legends/wolf.png",
                "./src/assest/images/legends/wukong.png",
                "./src/assest/images/legends/yong.png",
                "./src/assest/images/legends/lettuce.png",
                "./src/assest/images/legends/marina.png",
                // Add more image URLs as needed
              ];

              try {
                const canvas = createCanvas(769, 769);
                const ctx = canvas.getContext("2d");
                const background = await loadImage(
                  "./src/assest/images/background.png",
                );
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

                const bigX = await loadImage(
                  "./src/assest/images/colored_X.png",
                );
                ctx.drawImage(bigX, 493, 493, 276, 276);

                const small_white_X = await loadImage(
                  "./src/assest/images/small_white_X.png",
                );
                ctx.drawImage(small_white_X, 303, 75, 85, 85);

                const legendIndex = Math.floor(
                  Math.random() * legendImages.length,
                );
                const legends = await loadImage(legendImages[legendIndex]);
                ctx.drawImage(legends, 83, 50, 617, 631);

                const smallX = await loadImage(
                  "./src/assest/images/small_X.png",
                );
                ctx.drawImage(smallX, 43, 650, 85, 85);

                ctx.fillStyle = "#d9507c";
                ctx.font = `42px BebasNeue Regular`;
                ctx.fillText(userCode, 509, 460);

                ctx.fillStyle = "#ffffff";
                ctx.font = `42px BebasNeue Regular`;
                ctx.fillText(`SMASH CODE`, 340, 460);

                ctx.fillStyle = "#ffffff";
                ctx.font = `28px BebasNeue Regular`;
                ctx.translate(340, 460); // Set the rotation point
                ctx.rotate(-Math.PI / 2); // Rotate the text by -90 degrees
                ctx.fillText(`I`, -176, -268); // Position text
                ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the transformations

                ctx.fillStyle = "#1f1f25";
                ctx.font = `27px BebasNeue Regular`;
                ctx.translate(340, 460); // Set the rotation point
                ctx.rotate(-Math.PI / 2); // Rotate the text by -90 degrees
                ctx.fillText(`${interaction.guild.name}`, -168, -268); // Position text
                ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the transformations

                const username = ap_user.user.username.toUpperCase();
                const usernameLength = username.length;
                let fontSize = 63;
                let y = 420;

                if (usernameLength > 9) {
                  fontSize = 41;
                  y = 419;
                }

                ctx.fillStyle = "#ffae00";
                ctx.font = `${fontSize}px Venus Rising`;

                const textWidth = ctx.measureText(username).width;
                const x = (canvas.width - textWidth) / 2;

                ctx.fillText(`${username}`, x, y);

                const avatarURL = interaction.user.displayAvatarURL({
                  format: "jpg",
                });

                const attachment = new MessageAttachment(
                  canvas.toBuffer(),
                  interaction.guild.name +
                    "New-member" +
                    username +
                    userCode +
                    "-card.png",
                );
                const announcesMessage = await announces.send({
                  content: `Welcome ${ap_user} in **SUN** <@&${config.SquadSUN}> :partying_face:`,
                  files: [attachment],
                });
                var Emojis = [emojis.s_parfait, emojis.f_parfait];
                for (var i = 0; i < Emojis.length; i++) {
                  var React = Emojis[i];
                  await announcesMessage.react(React);
                }
              } catch (error) {
                console.error(error.message);
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

              //// Send message after accepting member ///
              await interaction
                .editReply({
                  embeds: [
                    {
                      title: `${emojis.check} Acceptance Alert`,
                      description: `${emojis.threadMarkmid} You accepted ${user} in **${interaction.guild.name}**\n${emojis.threadMark} His thread will be automatically archived in \`\`20 Seconds\`\``,
                      color: color.gray,
                    },
                  ],
                  //this is the important part
                  ephemeral: true,
                })
                .catch((err) => console.log("Error", err.message));
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
