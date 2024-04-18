const fs = require("fs");
require("dotenv").config();
const path = require("path");
const { Op, Sequelize } = require("sequelize");
const userLeave = require("../model/userLeave");
const { userMassage } = require("../config/message");
const leaveRequest = require("../model/leaveRequest");
const { user, imgPath, validateData } = require("../model/user");
const {
  role,
  roleByName,
  leaveDetails,
  pagination,
} = require("../config/variables");
const sendMail = require("../utility/sendMail");
const moment = require("moment");

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

module.exports.studentList = async (req, res) => {
  try {
    const { page, search, limit } = req.query;
    const roleId = role.student;
    if (search && search.trim()) {
      const searchResults = await user.findAll({
        where: {
          roleId,
          name: {
            [Op.like]: `%${search}%`,
          },
        },
        attributes: {
          exclude: ["password"],
        },
      });

      return res.status(200).json({
        message: userMassage.success.studentList,
        searchResults,
      });
    }
    const pageCount = page || pagination.pageCount;
    const limitDoc = parseInt(limit) || parseInt(pagination.limitDoc);
    const totalUser = await user.count({ where: { roleId } });
    const maxPage = totalUser <= limitDoc ? 1 : Math.ceil(totalUser / limitDoc);

    if (pageCount > maxPage)
      return res
        .status(400)
        .json({ message: `There are only ${maxPage} page` });

    const skip = parseInt((pageCount - 1) * limitDoc);

    const studentList = await user.findAll({
      where: { roleId },
      offset: skip,
      limit: limitDoc,
    });

    return res.status(200).json({
      message: userMassage.success.fetch,
      studentList,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: bookMassage.error.genericError });
  }
};

module.exports.hodList = async (req, res) => {
  try {
    const { page, search, limit } = req.query;
    const roleId = role.hod;
    if (search && search.trim()) {
      const searchResults = await user.findAll({
        where: {
          roleId,
          name: {
            [Op.like]: `%${search}%`,
          },
        },
        attributes: {
          exclude: ["password"],
        },
      });

      return res.status(200).json({
        searchResults,
        message: userMassage.success.studentList,
      });
    }
    const pageCount = page || pagination.pageCount;
    const limitDoc = parseInt(limit) || parseInt(pagination.limitDoc);
    const totalUser = await user.count({ where: { roleId } });
    const maxPage = totalUser <= limitDoc ? 1 : Math.ceil(totalUser / limitDoc);

    if (pageCount > maxPage)
      return res
        .status(400)
        .json({ message: `There are only ${maxPage} page` });

    const skip = parseInt((pageCount - 1) * limitDoc);

    const hodList = await user.findAll({
      where: { roleId },
      offset: skip,
      limit: limitDoc,
    });

    return res.status(200).json({
      hodList,
      message: userMassage.success.fetch,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: bookMassage.error.genericError });
  }
};

module.exports.facultyList = async (req, res) => {
  try {
    const { page, search, limit } = req.query;
    const roleId = role.faculty;
    if (search && search.trim()) {
      const searchResults = await user.findAll({
        where: {
          roleId,
          name: {
            [Op.like]: `%${search}%`,
          },
        },
        attributes: {
          exclude: ["password"],
        },
      });

      return res.status(200).json({
        searchResults,
        message: userMassage.success.studentList,
      });
    }
    const pageCount = page || pagination.pageCount;
    const limitDoc = parseInt(limit) || parseInt(pagination.limitDoc);
    const totalUser = await user.count({ where: { roleId } });
    const maxPage = totalUser <= limitDoc ? 1 : Math.ceil(totalUser / limitDoc);

    if (pageCount > maxPage)
      return res
        .status(400)
        .json({ message: `There are only ${maxPage} page` });

    const skip = parseInt((pageCount - 1) * limitDoc);

    const facultyList = await user.findAll({
      where: { roleId },
      offset: skip,
      limit: limitDoc,
    });

    return res.status(200).json({
      facultyList,
      message: userMassage.success.fetch,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: bookMassage.error.genericError });
  }
};

module.exports.editStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentDetails = await user.findByPk(id);
    const { image, email } = studentDetails;

    if (studentDetails.roleId != role.student)
      return res.status(400).json({
        message: userMassage.error.studentUpdateRole,
      });

    if (email != req.body.email) {
      const findUser = await checkUser(req.body.email);

      if (findUser) {
        if (req.file) await deleteFile(req.file);
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
          attributes: ["id", "name", "email", "div"],
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

module.exports.allLeaveStatus = async (req, res) => {
  try {
    const { search } = req.query;
    if (search && search.trim()) {
      const searchResults = await leaveRequest.findAll({
        where: {
          status: {
            [Op.like]: `%${search}%`,
          },
        },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: user,
            as: "requestedBy", // Use the correct alias for requestedBy association
            attributes: ["id", "name", "email"],
          },
          {
            model: user,
            as: "requestedTo", // Use the correct alias for requestedTo association
            attributes: ["id", "name", "email"],
          },
        ],
      });

      return res.status(200).json({
        message: userMassage.success.studentList,
        searchResults,
      });
    }
    const leaveStatus = await leaveRequest.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: user,
          as: "requestedBy", // Use the correct alias for requestedBy association
          attributes: ["id", "name", "email"],
        },
        {
          model: user,
          as: "requestedTo", // Use the correct alias for requestedTo association
          attributes: ["id", "name", "email"],
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
    const userId = req.user.id;
    const checkLeaveStatus = await leaveRequest.findOne({ where: { id } });
    const { status, requestToId } = checkLeaveStatus;
    if (requestToId != userId)
      return res.status(400).json({
        message: userMassage.error.leaveStatusError,
      });

    if (status == "Pending") {
      const leaveApproval = await leaveRequest.update(
        { status: "Approved" },
        { where: { id }, returning: true }
      );
      if (leaveApproval) {
        const leaveDetails = await leaveRequest.findOne({ where: { id } });
        const { startDate, endDate, userId } = leaveDetails;
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
    const userId = req.user.id;
    const checkLeaveStatus = await leaveRequest.findOne({ where: { id } });
    const { status, requestToId } = checkLeaveStatus;
    if (requestToId != userId)
      return res.status(400).json({
        message: userMassage.error.leaveStatusError,
      });
    if (status == "Pending") {
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

module.exports.profile = async (req, res) => {
  try {
    const {
      name,
      email,
      gender,
      image,
      roleId,
      phone,
      department,
      address,
      div,
    } = req.user;
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
