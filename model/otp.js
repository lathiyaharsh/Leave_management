const { DataTypes } = require("sequelize");
const db = require("../config/sequelize");

const otp = db.define("otp", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: "Please enter a valid email address",
      },
    },
  },
  otp: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = otp;
