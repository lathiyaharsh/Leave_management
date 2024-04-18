const { user } = require("./user");
const db = require("../config/sequelize");
const { DataTypes } = require("sequelize");
const userLeave = require("./userLeave");

const leaveRequest = db.define("leaveRequest", {
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
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  requestToId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  leaveType: {
    type: DataTypes.ENUM("First half", "Second half", "Full day"),
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Pending", "Rejected", "Approved"),
    defaultValue: "Pending",
    allowNull: false,
  },
});

leaveRequest.belongsTo(user, {
  onDelete: "CASCADE",
  foreignKey: "userId",
  as: "requestedBy",
});

leaveRequest.belongsTo(user, {
  onDelete: "CASCADE",
  foreignKey: "requestToId",
  as: "requestedTo",
});

leaveRequest.belongsTo(userLeave, {
  onDelete: "CASCADE",
  foreignKey: "userId",
  targetKey: "userId",
});

module.exports = leaveRequest;
