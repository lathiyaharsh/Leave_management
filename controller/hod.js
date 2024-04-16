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
const moment = require("moment");
const { where } = require("sequelize");

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

module.exports.registerFaculty = async (req, res) => {
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
    console.log(image.length);

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
      roleId: role.faculty,
    };

    const createUser = await user.create(newUser);

    if (!createUser)
      return res.status(400).json({ message: userMassage.error.signUperror });

    const getUserId = await findUserId(email);
    await this.setLeaveFaculty(req, res, getUserId);
    const emailDetails = {
      name,
      email,
      password: req.body.password,
    };
    await sendMail(req, res, emailDetails);
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

module.exports.setLeaveFaculty = async (req, res, userId) => {
  try {
    const {
      totalLeave,
      availableLeave,
      usedLeave,
      academicYear,
      totalWorkingDays,
      attendancePercentage,
    } = leaveDetails.hod;

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

module.exports.leaveStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const leaveStatus = await leaveRequest.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res
      .status(200)
      .json({ leaveStatus, message: userMassage.success.leaveStatus });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.leaveApproval = async (req, res) => {
  try {
    const id = req.params.id;

    const checkLeaveStatus = await leaveRequest.findOne({ where: { id } });
    
    if (checkLeaveStatus.status == "Pending") {
      const leaveApproval = await leaveRequest.update(
        { status: "Approved" },
        { where: { id }, returning: true }
      );
      if (leaveApproval) {
        const leaveDetails = await leaveRequest.findOne({ where: { id } });
        const { startDate, endDate , userId } = leaveDetails;
        const start = moment(startDate, "YYYY-MM-DD");
        const end = moment(endDate, "YYYY-MM-DD");
        const leaveDays = end.diff(start, "days") + 1;
        const leaveData = await userLeave.findOne({ where: { userId } });
        const availableLeave = leaveData.availableLeave - leaveDays;
        const usedLeave = leaveData.usedLeave + leaveDays;
        const remainingDays = leaveData.totalWorkingDays - usedLeave;
        const attendancePercentage = (
          (remainingDays * 100) /
          leaveData.totalWorkingDays
        ).toFixed(2);

        const updateLeaveDetails = {
          availableLeave,
          usedLeave,
          attendancePercentage,
        };

        const updateLeave = await userLeave.update(updateLeaveDetails, {
          where: { userId },
        });
        if (updateLeave)
          return res
            .status(200)
            .json({ message: userMassage.success.leaveApproval });
      }
    }

    return res.status(200).json({ message: userMassage.error.leaveStatus });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.leaveReject = async (req, res) => {
  try {
    const id = req.params.id;
    const checkLeaveStatus = await leaveRequest.findOne({ where: { id } });

    if (checkLeaveStatus.status == "Pending") {
        const leaveReject = await leaveRequest.update(
            { status: "Rejected" },
            { where: { id }, returning: true }
          );
          return res.status(200).json({ message: userMassage.success.leaveReject });
    }
    return res.status(200).json({ message: userMassage.error.leaveStatus });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};
