require("dotenv").config();
const { Op, Sequelize } = require("sequelize");
const { userMassage } = require("../config/message");
const { role, pagination } = require("../config/variables");
const sendLeaveUpdate = require("../utility/sendLeaveUpdate");
const moment = require("moment");
const validateDates = require("../utility/validateDates");
const {
  createLeaveRequest,
  findAllLeaveRequest,
  countUserLeaveRequest,
  findLeaveRequest,
  updateLeaveRequest,
} = require("../service/leaveRequest");
const {
  findUserLeave,
  countUserLeave,
  findAllUserLeave,
  updateUserLeave,
} = require("../service/userLeave");
const { user } = require("../model/user");
const userLeave = require("../model/userLeave");

module.exports.allLeaveStatus = async (req, res) => {
  try {
    const { search, userRole, limit, page, sort } = req.query;
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

    const totalLeave = await countUserLeaveRequest(whereCondition);
    const maxPage =
      totalLeave <= limitDoc ? 1 : Math.ceil(totalLeave / limitDoc);

    if (pageCount > maxPage)
      return res
        .status(400)
        .json({ message: `There are only ${maxPage} page` });

    const skip = parseInt((pageCount - 1) * limitDoc);

    let order = [["createdAt", "DESC"]];

    if (sort) {
      const sortParams = sort.split(",");
      order = sortParams.map((param) => {
        const [field, direction] = param.split(":");
        return [field, direction === "desc" ? "DESC" : "ASC"];
      });
    }
    const include = [
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
    ];
    const attributes = {};
    const searchResults = await findAllLeaveRequest(
      whereCondition,
      attributes,
      order,
      include,
      skip,
      limitDoc
    );

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
    const { search, limit, page, sort } = req.query;
    const requestToId = req.user.id;
    let whereCondition = {};

    if (req.user.roleId !== 1) {
      whereCondition = { requestToId };
    }

    if (search && search.trim()) {
      whereCondition.status = {
        [Op.like]: `${search}%`,
      };
    }

    const attributes = {
      include: [
        [
          Sequelize.literal(`DATEDIFF(endDate, startDate) + 1`),
          "leaveDifference",
        ],
      ],
    };

    let order = [["createdAt", "DESC"]];

    if (sort) {
      const sortParams = sort.split(",");
      order = sortParams.map((param) => {
        const [field, direction] = param.split(":");
        return [field, direction === "desc" ? "DESC" : "ASC"];
      });
    }

    const include = [
      {
        model: userLeave,
        attributes: ["usedLeave", "availableLeave"],
      },
      {
        model: user,
        as: "requestedBy",
        attributes: ["id", "name", "email", "div", "roleId"],
      },
    ];

    const pageCount = page || pagination.pageCount;
    const limitDoc = parseInt(limit) || parseInt(pagination.limitDoc);
    const skip = parseInt((pageCount - 1) * limitDoc);

    const totalLeave = await countUserLeaveRequest(whereCondition);
    const maxPage =
      totalLeave <= limitDoc ? 1 : Math.ceil(totalLeave / limitDoc);

    if (pageCount > maxPage) {
      return res
        .status(400)
        .json({ message: `There are only ${maxPage} pages` });
    }

    const leaveStatus = await findAllLeaveRequest(
      whereCondition,
      attributes,
      order,
      include,
      skip,
      limitDoc
    );

    if (!leaveStatus || leaveStatus.length === 0) {
      return res
        .status(404)
        .json({ message: userMassage.error.leaveRequestNotFound });
    }

    return res.status(200).json({
      leaveStatus,
      message: userMassage.success.leaveStatus,
      maxPage: maxPage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.leaveApproval = async (req, res) => {
  try {
    const id = req.params.id;
    const loginUser = req.user.id;
    const checkLeaveStatus = await findLeaveRequest({ id });

    if (!checkLeaveStatus)
      return res
        .status(400)
        .json({ message: userMassage.error.leaveRequestNotFound });
    const { status, requestToId } = checkLeaveStatus;

    if (req.user.roleId != 1) {
      if (requestToId != loginUser)
        return res.status(400).json({
          message: userMassage.error.leaveStatusError,
        });
    }

    if (status != "Pending")
      return res.status(400).json({ message: userMassage.error.leaveStatus });

    const leaveApproval = await updateLeaveRequest(
      { id },
      { status: "Approved" }
    );

    if (!leaveApproval)
      return res.status(400).json({ message: userMassage.error.leaveApproval });

    const leaveDetails = await findLeaveRequest({ id });
    const { startDate, endDate, userId, leaveType } = leaveDetails;
    const start = moment(startDate, "YYYY-MM-DD");
    const end = moment(endDate, "YYYY-MM-DD");
    const leaveDays = start.isSame(end, "day")
      ? 0.5
      : end.diff(start, "days") + 1;
    const leaveData = await findUserLeave({ userId });
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

    const updateLeave = await updateUserLeave(updateLeaveDetails, { userId });

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
    !sendMail.valid
      ? (userMsg += userMassage.error.mail)
      : (userMsg += userMassage.success.mail);

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
    const checkLeaveStatus = await findLeaveRequest({ id });
    if (!checkLeaveStatus)
      return res
        .status(400)
        .json({ message: userMassage.error.leaveRequestNotFound });
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

    const leaveReject = await updateLeaveRequest(
      { id },
      { status: "Rejected" }
    );
    console.log(leaveReject);
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
    !sendMail.valid
      ? (userError += userMassage.error.mail)
      : (userError += userMassage.success.mail);

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

    const totalLeave = await countUserLeave();
    const maxPage =
      totalLeave <= limitDoc ? 1 : Math.ceil(totalLeave / limitDoc);

    if (pageCount > maxPage)
      return res
        .status(400)
        .json({ message: `There are only ${maxPage} page` });

    const skip = parseInt((pageCount - 1) * limitDoc);

    const attributes = {
      exclude: ["id", "academicYear", "createdAt", "updatedAt"],
    };
    const include = [
      {
        model: user,
        attributes: ["name", "email", "roleId"],
      },
    ];
    const order = [["usedLeave", "DESC"]];

    const leaveReport = await findAllUserLeave(
      attributes,
      order,
      include,
      skip,
      limitDoc
    );

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

    const checkLeave = await countUserLeaveRequest({ userId, status });
    if (checkLeave.count <= 3) {
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

      const createLeave = await createLeaveRequest(leaveDetails);
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
    const { search, limit, page, sort } = req.query;

    let whereCondition = { userId };
    if (search && search.trim()) {
      whereCondition = {
        userId,
        name: {
          [Op.like]: `%${search}%`,
        },
      };
    }
    const attributes = {
      exclude: ["updatedAt"],
    };
    let order = [["createdAt", "DESC"]];

    if (sort) {
      const sortParams = sort.split(",");
      order = sortParams.map((param) => {
        const [field, direction] = param.split(":");
        return [field, direction === "desc" ? "DESC" : "ASC"];
      });
    }
    const include = [
      {
        model: user,
        as: "requestedTo",
        attributes: ["name", "email"],
      },
    ];
    const pageCount = page || pagination.pageCount;
    const limitDoc = parseInt(limit) || parseInt(pagination.limitDoc);
    const skip = parseInt((pageCount - 1) * limitDoc);

    const totalLeave = await countUserLeaveRequest(whereCondition);
    const maxPage =
      totalLeave <= limitDoc ? 1 : Math.ceil(totalLeave / limitDoc);

    if (pageCount > maxPage) {
      return res
        .status(400)
        .json({ message: `There are only ${maxPage} pages` });
    }
    const leaveStatus = await findAllLeaveRequest(
      whereCondition,
      attributes,
      order,
      include,
      skip,
      limitDoc
    );

    return res
      .status(200)
      .json({ leaveStatus, message: userMassage.success.leaveStatus , maxPage});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.leaveBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const whereCondition = { userId };
    const attributes = {
      exclude: ["id", "createdAt", "updatedAt"],
    };
    const leaveBalance = await findUserLeave(whereCondition, attributes);
    if (!leaveBalance) {
      return res.status(400).json({ message: userMassage.error.leaveBalance });
    }
    return res
      .status(200)
      .json({ leaveBalance, message: userMassage.success.leaveBalance });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};
