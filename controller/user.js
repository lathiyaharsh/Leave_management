const fs = require("fs");
require("dotenv").config();
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userLeave = require("../model/userLeave");
const { userMassage } = require("../config/message");
const leaveRequest = require("../model/leaveRequest");
const { user, imgPath, validateData } = require("../model/user");
const { role, roleByName, leaveDetails } = require("../config/variables");
const sendMail = require("../utility/sendMail");
const validateDates = require("../utility/validateDates");
const { where } = require("sequelize");

const checkUser = async (email) => {
  try {
    const findUserDetails = await user.findOne({ where: { email } });
    if (findUserDetails) return true;
  } catch (error) {
    console.log(error);
  }
};

const deleteFile = async (file) => {
  try {
    await fs.unlinkSync(file.path);
  } catch (error) {
    console.log(error);
  }
};

const findUserId = async (email) => {
  try {
    const findUserDetails = await user.findOne({ where: { email } });
    if (findUserDetails) return findUserDetails.id;
  } catch (error) {
    console.log(error);
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await user.findOne({ where: { email } });

    if (!findUser)
      return res.status(404).json({ message: userMassage.error.userNotFound });

    const isValidPassword = await bcrypt.compare(password, findUser.password);

    {
      const { id, name, email, phone, roleId } = findUser;
      const role = roleByName[roleId];
      const userDetails = {
        id,
        name,
        email,
        phone,
        role,
      };

      const token = isValidPassword
        ? await jwt.sign({ userDetails }, process.env.SECRETKEY, {
            expiresIn: "1h",
          })
        : null;

      if (isValidPassword) {
        res.cookie("jwt", token, { httpOnly: true });
        return res.status(200).json({
          message: userMassage.success.loginSuccess,
          token,
        });
      }
    }

    return res.status(400).json({ message: userMassage.error.wrongPassword });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.register = async (req, res) => {
  try {
    if (!req.body && !req.file)
      return res.status(400).json({ message: userMassage.error.fillDetails });

    const { error, value } = validateData(req.body);

    if (error) {
      if (req.file) await fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      name,
      email,
      password,
      confirmPassword,
      gender,
      grNumber,
      phone,
      address,
      department,
      div,
    } = req.body;

    if (confirmPassword !== password) {
      await deleteFile(req.file);
      return res
        .status(400)
        .json({ message: userMassage.error.passwordNotMatch });
    }

    const findUser = await checkUser(email);

    if (findUser) {
      await deleteFile(req.file);
      return res.status(400).json({
        message: userMassage.error.invalidEmail,
      });
    }

    let image = "";
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      image = baseUrl + imgPath + "/" + req.file.filename;
    }

    const newUser = {
      name,
      email,
      gender,
      image,
      grNumber,
      phone,
      address,
      department,
      div,
      password: await bcrypt.hash(password, 10),
      roleId: role.student,
    };

    const createUser = await user.create(newUser);

    if (!createUser)
      return res.status(400).json({ message: userMassage.error.signUpError });

    const getUserId = await findUserId(email);
    await this.setLeave(req, res, getUserId);
    const emailDetails = {
      name,
      email,
      password: req.body.password,
    };
    const sendEmail = await sendMail(req, res, emailDetails);
    if (sendEmail.valid)
      return res
        .status(201)
        .json({ message: userMassage.success.signUpSuccessWithEmail });
    return res.status(201).json({ message: userMassage.success.signUpSuccess });
  } catch (error) {
    if (req.file) await deleteFile(req.file);
    if (error.name === "SequelizeValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors });
    }
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.profile = async (req, res) => {
  try {
    const {
      name,
      email,
      gender,
      image,
      roleId,
      phone,
      grNumber,
      address,
      div,
    } = req.user;
    const userDetails = {
      name,
      email,
      gender,
      image,
      phone,
      grNumber,
      address,
      div,
      user: roleByName[roleId],
    };

    return res.status(200).json({
      message: userMassage.success.profileRetrieved,
      profile: userDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: userMassage.error.genericError });
  }
};

module.exports.setLeave = async (req, res, userId) => {
  try {
    const {
      totalLeave,
      availableLeave,
      usedLeave,
      academicYear,
      totalWorkingDays,
      attendancePercentage,
    } = leaveDetails.student;

    const studentLeave = {
      userId,
      totalLeave,
      availableLeave,
      usedLeave,
      academicYear,
      totalWorkingDays,
      attendancePercentage,
    };

    const createUserLeave = await userLeave.create(studentLeave);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: userMassage.error.genericError });
  }
};

module.exports.editUser = async (req, res) => {
  try {
    const { id, image, email } = req.user;
    if (email != req.body.email) {
      const findUser = await checkUser(req.body.email);

      if (findUser) {
        await deleteFile(req.file);
        return res.status(400).json({
          message: userMassage.error.invalidEmail,
        });
      }
    }
    if (req.file) {
      const parsedUrl = new URL(image);
      const imagePath = parsedUrl.pathname;
      const fullPath = path.join(__dirname, "..", imagePath);
      await fs.unlinkSync(fullPath);

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      req.body.image = baseUrl + imgPath + "/" + req.file.filename;
    }

    const editUser = await user.update(req.body, {
      where: { id },
      runValidators: true,
    });

    if (!editUser)
      return res.status(400).json({
        message: userMassage.error.update,
      });

    return res.status(200).json({
      message: userMassage.success.update,
    });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors });
    }
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({
      message: userMassage.success.logout,
    });
  } catch (error) {
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = "Pending";
    const checkLeave = await leaveRequest.findAndCountAll({
      where: { userId, status },
    });

    if (checkLeave.count <= 2) {
      const { startDate, endDate, leaveType, reason } = req.body;
      const requestToId = req.body?.requestToId || 2;
      const dates = {
        startDate,
        endDate,
      };
      const checkDates = await validateDates(dates);
      if (!checkDates.valid) {
        return res.status(400).json({ message: checkDates.message });
      }
      const leaveDetails = {
        userId,
        startDate,
        endDate,
        leaveType,
        reason,
        requestToId,
      };

      const createLeave = await leaveRequest.create(leaveDetails);
      if (!createLeave)
        return res
          .status(400)
          .json({ message: userMassage.error.leaveRequest });

      return res
        .status(201)
        .json({ message: userMassage.success.leaveRequest });
    }
    return res
      .status(201)
      .json({ message: userMassage.error.leaveRequestLimit });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors });
    }
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.leaveStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const leaveStatus = await leaveRequest.findAll({
      where: { userId },
      attributes: { exclude: ["updatedAt"] },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: user,
          as: "requestedTo",
          attributes: ["name", "email"],
        },
      ],
    });
    return res
      .status(200)
      .json({ leaveStatus, message: userMassage.success.leaveStatus });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.leaveBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaveBalance = await userLeave.findOne({
      where: { userId },
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
    });
    return res
      .status(200)
      .json({ leaveBalance, message: userMassage.success.leaveBalance });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};
