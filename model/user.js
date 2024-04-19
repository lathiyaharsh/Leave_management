const path = require("path");
const multer = require("multer");
const imgPath = "/uploads/user";
const { DataTypes } = require("sequelize");
const db = require("../config/sequelize");
const role = require("./role");
const Joi = require('joi');
const validator = require('validator');

const user = db.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 30],
      },
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 200],
      },
    },
    grNumber:{
      type: DataTypes.STRING,
    },
    phone:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    address:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    department:{
        type: DataTypes.STRING,
    },
    div:{
        type: DataTypes.STRING,
    },
    roleId:{
        type:DataTypes.INTEGER,
        allowNull: false,
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["email", "password"],
      },
    ],
  }
);

function validateData(datas) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(8).required(),
    confirmPassword: Joi.string().min(4).max(8).required(),
    gender: Joi.string().valid("male", "female").required(),
    grNumber: Joi.string().allow(null).optional(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    department: Joi.string().allow(null).optional(),
    div: Joi.string().allow(null).optional(),
  });
  return schema.validate(datas);
}

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", imgPath));
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + extension);
  },
});

const uploadImgPath = multer({ storage: imageStorage }).single("image");
user.belongsTo(role,{onDelete:"CASCADE", foreignKey:"roleId"})

module.exports = { user, uploadImgPath, imgPath , validateData};
