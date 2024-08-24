const mongoose = require("mongoose");
require("dotenv").config();

async function dbConnect() {
    const databaseURL = process.env.MONGO_ATLAS_URL;
  try {
    if (await mongoose.connect(databaseURL)) {
      console.log("Database connect successfully");
    }
  } catch (error) {
    console.log("Something went wrong during DB Connection");
  }
}

module.exports = dbConnect;
