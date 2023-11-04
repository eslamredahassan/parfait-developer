const mongoose = require("mongoose");
const moment = require("moment");
const config = require("../config");

module.exports = async () => {
  // Connect to MongoDB
  mongoose
    .connect(config.database, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(
        `\x1b[0m`,
        `\x1b[31m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Database`,
        `\x1b[32m CONNECTED`,
      );
    })
    .catch((error) => {
      console.log(
        `\x1b[0m`,
        `\x1b[31m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Database`,
        `\x1b[323m ERROR: ${error.message}`,
      );
    });
};
