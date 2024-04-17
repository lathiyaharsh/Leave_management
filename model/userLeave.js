const { user } = require('./user');
const db = require('../config/sequelize');
const { DataTypes } = require('sequelize');

const userLeave = db.define("userLeave",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false,
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    totalLeave:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    availableLeave:{
        type:DataTypes.DECIMAL(4,2),
        allowNull:false,
    },
    usedLeave:{
        type:DataTypes.DECIMAL(4,2),
        allowNull:false,
    },
    academicYear:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    totalWorkingDays:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    attendancePercentage:{
        type:DataTypes.DECIMAL(5,2),
        allowNull:false,
    }

})

userLeave.belongsTo(user,{onDelete:"CASCADE",foreignKey:"userId"});

module.exports = userLeave;


