const mongoose = require("mongoose");
require("dotenv").config();

async function main() {
    
  const atlasUrl = process.env.MONGO_ATLAS_URL;
  await mongoose
    .connect(atlasUrl)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((error) => {
      console.log("Error connecting to Mongo Atlas", error);
    });
}

module.exports = { main };
