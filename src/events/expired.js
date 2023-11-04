const cron = require("node-cron");
const moment = require("moment");
// Import your Mongoose model
const TemporaryRole = require("../../src/database/models/TemporaryRoleModel");

module.exports = async (client, config) => {
  // Run this function every minute (adjust the cron schedule as needed)
  cron.schedule("* * * * *", async () => {
    const currentTime = new Date();
    const expiredRoles = await TemporaryRole.find({
      expiry: { $lt: currentTime },
    });

    for (const role of expiredRoles) {
      const guild = client.guilds.cache.get(role.guildId);
      if (!guild) continue;

      let member;
      try {
        member = await guild.members.fetch(role.userId);
      } catch (error) {
        console.error(`Error fetching member: ${error.message}`);
        continue;
      }

      if (member) {
        const roleId = role.roleId; // Assuming this is the ID of the role

        if (member.roles.cache.has(roleId)) {
          try {
            await member.roles.remove(roleId);
            console.log(
              `\x1b[0m`,
              `\x1b[31m 🛠`,
              `\x1b[33m ${moment(Date.now()).format("lll")}`,
              `\x1b[34m ${member.user.username}`,
              `\x1b[32m Finished his frozen period`,
            );
            // Send a message in a specific channel
            const channel = guild.channels.cache.get(config.log); // Replace with your channel ID
            if (channel && channel.isText()) {
              channel.send({
                embeds: [
                  {
                    title: `<:log:1156940336501887047> Frozen Log`,
                    description: `<:check:1088116412960219237> ${member.user} Finished his frozen period`,
                    color: `#2b2d31`,
                    timestamp: new Date(),
                    footer: {
                      text: "Rejected in",
                      icon_url: `https://i.imgur.com/NpNsiR1.png`,
                    },
                  },
                ],
                //this is the important part
                ephemeral: false,
              });
            }
            member.send({
              embeds: [
                {
                  title: `<:log:1156940336501887047> Frozen Log`,
                  description: `<:check:1088116412960219237> Your frozen period has been end feel free to reapply again`,
                  color: `#2b2d31`,
                  timestamp: new Date(),
                  footer: {
                    text: "Rejected in",
                    icon_url: `https://i.imgur.com/NpNsiR1.png`,
                  },
                },
              ],
              //this is the important part
              ephemeral: false,
          });
          } catch (error) {
            console.error(
              `\x1b[0m`,
              `\x1b[31m 🛠`,
              `\x1b[33m Error removing ${role.name} role:`,
              `\x1b[34m ${error.message}`,
            );
          }
        } else {
          console.log(
            `\x1b[0m`,
            `\x1b[31m 🛠`,
            `\x1b[33m ${member.user.username}`,
            `\x1b[34m does not have the ${role.name} role`,
          );
        }
        try {
          await TemporaryRole.deleteOne({ _id: role._id }); // Remove the expired role entry from the database
          console.log(
            `\x1b[0m`,
            `\x1b[31m 🛠`,
            `\x1b[33m ${moment(Date.now()).format("lll")}`,
            `\x1b[34m Frozen entry removed from the database`,
          );
        } catch (error) {
          console.error(
            `\x1b[0m`,
            `\x1b[31m 🛠`,
            `\x1b[33m Error removing frozen entry from the database:`,
            `\x1b[34m ${error.message}`,
          );
        }
      }
    }
  });
};
