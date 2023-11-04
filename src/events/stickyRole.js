const cron = require("node-cron");
const moment = require("moment");
// Import your Mongoose model
const TemporaryRole = require("../../src/database/models/TemporaryRoleModel");

module.exports = async (client, config) => {
  // Other code and setup

  // Function to reapply temporary roles for rejoining members
  const reapplyTemporaryRoles = async () => {
    const currentTime = new Date();
    const guild = client.guilds.cache.get(config.guildID);
    if (!guild) return;

    const allMembers = await guild.members.fetch();

    for (const [memberId, member] of allMembers) {
      const existingRoles = await TemporaryRole.find({
        userId: memberId,
        expiry: { $gt: currentTime },
      });

      for (const role of existingRoles) {
        const roleId = role.roleId;

        if (member && member.manageable && member.roles) {
          if (!member.roles.cache.has(roleId)) {
            try {
              await member.roles.add(roleId);
              console.log(
                `\x1b[0m`,
                `\x1b[31m 🛠`,
                `\x1b[33m ${moment(Date.now()).format("lll")}`,
                `\x1b[34m ${role.name} role`,
                `\x1b[32m Reassigned to ${member.user.username}`,
              );
            } catch (error) {
              console.error(
                `Error reassigning ${role.name} role:`,
                error.message,
              );
            }
          }
        }
      }
    }
  };

  // Schedule the cron job to run every hour (adjust as needed)
  cron.schedule("*/1 * * * *", async () => {
    reapplyTemporaryRoles();
  });

  // Other code
};
