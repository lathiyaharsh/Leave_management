const fs = require("fs");
require("dotenv").config();
const { Op, Sequelize } = require("sequelize");
const userLeave = require("../model/userLeave");
const { userMassage } = require("../config/message");
const leaveRequest = require("../model/leaveRequest");
const { user } = require("../model/user");
const { role, pagination } = require("../config/variables");

const sendLeaveUpdate = require("../utility/sendLeaveUpdate");
const moment = require("moment");
const validateDates = require("../utility/validateDates");



module.exports.allLeaveStatus = async (req, res) => {
  try {
    const { search, userRole, limit, page } = req.query;
    let whereCondition = {};

    if (search && search.trim()) {
      whereCondition.status = {
        [Op.like]: `${search}%`,
      };
    }

    if (userRole) {
      const findRole = role[userRole];
      whereCondition.roleId = findRole;
    }

    const pageCount = page || pagination.pageCount;
    const limitDoc = parseInt(limit) || parseInt(pagination.limitDoc);
    const totalLeave = await leaveRequest.count({ where: whereCondition });
    const maxPage =
      totalLeave <= limitDoc ? 1 : Math.ceil(totalLeave / limitDoc);

    if (pageCount > maxPage)
      return res
        .status(400)
        .json({ message: `There are only ${maxPage} page` });

    const skip = parseInt((pageCount - 1) * limitDoc);

    const searchResults = await leaveRequest.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: userLeave,
          attributes: ["usedLeave", "availableLeave"],
        },
        {
          model: user,
          as: "requestedBy",
          attributes: ["id", "name", "email", "roleId"],
        },
        {
          model: user,
          as: "requestedTo",
          attributes: ["id", "name", "email", "roleId"],
        },
      ],
      offset: skip,
      limit: limitDoc,
    });

    return res.status(200).json({
      message: userMassage.success.studentList,
      searchResults,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.leaveStatus = async (req, res) => {
  try {
    const requestToId = req.user.id;
    const leaveStatus = await leaveRequest.findAll({
      attributes: {
        include: [
          [
            Sequelize.literal(`DATEDIFF(endDate, startDate) + 1`),
            "leaveDifference",
          ],
        ],
      },
      where: { requestToId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: userLeave,
          attributes: ["usedLeave", "availableLeave"],
        },
        {
          model: user,
          as: "requestedBy",
          attributes: ["id", "name", "email", "div", "roleId"],
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

module.exports.leaveApproval = async (req, res) => {
  try {
    const id = req.params.id;
    const loginUser = req.user.id;
    const checkLeaveStatus = await leaveRequest.findOne({ where: { id } });
    const { status, requestToId } = checkLeaveStatus;

    if (req.user.roleId != 1) {
      if (requestToId != loginUser)
        return res.status(400).json({
          message: userMassage.error.leaveStatusError,
        });
    }

    if (status != "Pending")
      return res.status(400).json({ message: userMassage.error.leaveStatus });

    const leaveApproval = await leaveRequest.update(
      { status: "Approved" },
      { where: { id }, returning: true }
    );

    if (!leaveApproval)
      return res.status(400).json({ message: userMassage.error.leaveApproval });

    const leaveDetails = await leaveRequest.findOne({ where: { id } });
    const { startDate, endDate, userId, leaveType } = leaveDetails;
    const start = moment(startDate, "YYYY-MM-DD");
    const end = moment(endDate, "YYYY-MM-DD");
    const leaveDays = start.isSame(end, "day")
      ? 0.5
      : end.diff(start, "days") + 1;
    const leaveData = await userLeave.findOne({ where: { userId } });
    const availableLeave = leaveData.availableLeave - leaveDays;
    const usedLeave = Number(leaveData.usedLeave) + Number(leaveDays);
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

    let userMsg = "";

    if (!updateLeave) userMsg += userMassage.error.userLeaveRec;

    const emailDetails = {
      userId,
      startDate,
      endDate,
      leaveType,
      status: "Approved",
    };

    const sendMail = await sendLeaveUpdate(emailDetails);
    !sendMail.valid ? userMsg += userMassage.error.mail : userMsg += userMassage.success.mail;

    return res.status(200).json({
      message: userMassage.success.leaveApproval,
      email: userMsg,
    
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.leaveReject = async (req, res) => {
  try {
    const id = req.params.id;
    const loginUser = req.user.id;
    const checkLeaveStatus = await leaveRequest.findOne({ where: { id } });
    const { status, requestToId, userId, startDate, endDate, leaveType } =
      checkLeaveStatus;

    if (req.user.roleId != 1) {
      if (requestToId != loginUser)
        return res.status(400).json({
          message: userMassage.error.leaveStatusError,
        });
    }

    if (status != "Pending")
      return res.status(200).json({ message: userMassage.error.leaveStatus });

    const leaveReject = await leaveRequest.update(
      { status: "Rejected" },
      { where: { id }, returning: true }
    );
    if (!leaveReject)
      return res.status(400).json({
        message: userMassage.error.leaveReject,
      });
    const emailDetails = {
      userId,
      startDate,
      endDate,
      leaveType,
      status: "Rejected",
    };

    const sendMail = await sendLeaveUpdate(emailDetails);
    let userError = "";
    !sendMail.valid ? userError += userMassage.error.mail : userError += userMassage.success.mail;

    return res.status(200).json({
      message: userMassage.success.leaveReject,
      mail: userError,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.leaveReport = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const pageCount = page || pagination.pageCount;
    const limitDoc = parseInt(limit) || parseInt(pagination.limitDoc);
    const totalLeave = await userLeave.count({});
    const maxPage =
      totalLeave <= limitDoc ? 1 : Math.ceil(totalLeave / limitDoc);

    if (pageCount > maxPage)
      return res
        .status(400)
        .json({ message: `There are only ${maxPage} page` });

    const skip = parseInt((pageCount - 1) * limitDoc);

    const leaveReport = await userLeave.findAll({
      attributes: {
        exclude: ["id", "academicYear", "createdAt", "updatedAt"],
      },
      order: [["usedLeave", "DESC"]],
      include: [
        {
          model: user,
          attributes: ["name", "email", "roleId"],
        },
      ],
      offset: skip,
      limit: limitDoc,
    });

    return res
      .status(200)
      .json({ leaveReport, message: userMassage.success.leaveReport });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = "Pending";
    const { roleId } = req.user;
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
        roleId,
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

module.exports.userLeaveStatus = async (req, res) => {
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
