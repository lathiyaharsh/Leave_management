const db = require("../config/sequelize");

(async () => {
  try {
    await db.sync();
    console.log("Tables synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing tables: ", error);
  }
})();

module.exports = db;
