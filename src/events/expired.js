const cron = require("node-cron");
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

      const member = await guild.members.fetch(role.userId);
      if (member) {
        const roleId = role.roleId; // Assuming this is the ID of the role

        if (member.roles.cache.has(roleId)) {
          try {
            await member.roles.remove(roleId);
            console.log(`Freeze Role Removed`);
          } catch (error) {
            console.error("Error removing role:", error.message);
          }
        } else {
          console.log("Member does not have the specified role");
        }

        try {
          await TemporaryRole.deleteOne({ _id: role._id }); // Remove the expired role entry from the database
          console.log("Expired role entry removed from the database");
        } catch (error) {
          console.error(
            "Error removing expired role entry from the database:",
            error.message,
          );
        }
      }
    }
  });
};
