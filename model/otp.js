const { DataTypes } = require("sequelize");
const db = require("../config/sequelize");
const { user } = require("./user");
const  role  = require("./role");

const otp = db.define("otp", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
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
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

otp.belongsTo(user, { onDelete: "CASCADE", foreignKey: "userId" });
otp.belongsTo(role, { onDelete: "CASCADE", foreignKey: "roleId" });
module.exports = otp;
