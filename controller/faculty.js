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

module.exports.leaveStatus = async (req, res) => {
  try {

    const leaveStatus = await leaveRequest.findAll({
      order: [["createdAt", "DESC"]],
      include: [{
          model: user,       
          as:"requestedBy",      
          attributes: ['id', 'name', 'email']
      }]
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
        const { startDate, endDate, userId } = leaveDetails;
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

module.exports.profile = async (req, res) => {
  try {
    const { name, email, gender, image, roleId, phone, department, address , div} =
      req.user;
    const userDetails = {
      name,
      email,
      gender,
      image,
      phone,
      department,
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