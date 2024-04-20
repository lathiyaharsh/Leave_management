const fs = require("fs");
require("dotenv").config();
const path = require("path");
const bcrypt = require("bcrypt");
const { Op, Sequelize } = require("sequelize");
const userLeave = require("../model/userLeave");
const { userMassage } = require("../config/message");
const leaveRequest = require("../model/leaveRequest");
const { user, imgPath, validateData } = require("../model/user");
const { role, leaveDetails, pagination } = require("../config/variables");
const sendMail = require("../utility/sendMail");
const moment = require("moment");
const sendLeaveUpdate = require("../utility/sendLeaveUpdate");

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

module.exports.registerHod = async (req, res) => {
  try {
    if (!req.body && !req.file && req.file == undefined)
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
      roleId: role.hod,
    };

    const createUser = await user.create(newUser);

    if (!createUser)
      return res.status(400).json({ message: userMassage.error.signUpError });

    const getUserId = await findUserId(email);
    const setLeave = await this.setLeaveHod(getUserId);
    let userError = "";
    if (!setLeave) userError = userMassage.error.userLeave;

    const emailDetails = {
      name,
      email,
      password: req.body.password,
    };

    const sendEmail = await sendMail(emailDetails);
    if (!sendEmail.valid) userError += userMassage.error.mail;

    return res
      .status(201)
      .json({ message: userMassage.success.signUpSuccess, userError });
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

module.exports.setLeaveHod = async (userId) => {
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
    if (!createUserLeave) {
      return { valid: true };
    }
    return true;
  } catch (error) {
    console.log(error);
  }
};

module.exports.editHod = async (req, res) => {
  try {
    const { id } = req.params;
    const hodDetails = await user.findByPk(id);
    const { image, email } = hodDetails;

    if (hodDetails.roleId != role.hod)
      return res.status(400).json({
        message: userMassage.error.hodUpdateRole,
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
      return res.status(400).json({ message: userMassage.error.signUpError });

    const getUserId = await findUserId(email);
    const setLeave = await this.setLeaveFaculty(getUserId);

    let userError = "";
    if (!setLeave) userError = userMassage.error.userLeave;

    const emailDetails = {
      name,
      email,
      password: req.body.password,
    };
    const sendEmail = await sendMail(emailDetails);
    if (!sendEmail.valid) userError += userMassage.error.mail;

    return res
      .status(201)
      .json({ message: userMassage.success.signUpSuccess, userError });
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

module.exports.setLeaveFaculty = async (userId) => {
  try {
    const {
      totalLeave,
      availableLeave,
      usedLeave,
      academicYear,
      totalWorkingDays,
      attendancePercentage,
    } = leaveDetails.faculty;

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
    if (!createUserLeave) {
      return { valid: true };
    }
    return true;
  } catch (error) {
    console.log(error);
  }
};

module.exports.editFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const facultyDetails = await user.findByPk(id);
    const { image, email } = hodDetails;

    if (facultyDetails.roleId != role.faculty)
      return res.status(400).json({
        message: userMassage.error.facultyUpdateRole,
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

module.exports.leaveStatus = async (req, res) => {
  try {
    const { search, userRole, page, limit } = req.query;
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
      attributes: {
        include: [
          [
            Sequelize.literal(`DATEDIFF(endDate, startDate) + 1`),
            "leaveDifference",
          ],
        ],
      },
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

module.exports.leaveApproval = async (req, res) => {
  try {
    const id = req.params.id;

    const checkLeaveStatus = await leaveRequest.findOne({ where: { id } });

    if (checkLeaveStatus.status != "Pending")
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

    let userError = "";

    if (!updateLeave) userError += userMassage.error.userLeaveRec;

    const emailDetails = {
      userId,
      startDate,
      endDate,
      leaveType,
      status: "Approved",
    };

    const sendMail = await sendLeaveUpdate(emailDetails);
    if (!sendMail.valid) userError += userMassage.error.mail;

    return res.status(200).json({
      message: userMassage.success.leaveApproval,
      userError,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.leaveReject = async (req, res) => {
  try {
    const id = req.params.id;
    const checkLeaveStatus = await leaveRequest.findOne({ where: { id } });
    const { status, userId, startDate, endDate, leaveType } = checkLeaveStatus;
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
    if (sendMail.valid)
      return res.status(201).json({ message: userMassage.success.leaveUpdate });

    return res.status(200).json({
      message: userMassage.success.leaveReject,
      update: userMassage.success.leaveUpdateWithOutEmail,
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

module.exports.removeUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteImage = await user.findByPk(id);
    const { image } = deleteImage;
    const parsedUrl = new URL(image);
    const imagePath = parsedUrl.pathname;
    const fullPath = path.join(__dirname, "..", imagePath);
    try {
      await fs.unlinkSync(fullPath);
    } catch (error) {
      console.log(error);
    }

    const removeUser = await user.destroy({ where: { id } });

    if (!removeUser)
      return res.status(400).json({ message: userMassage.error.removeUser });

    return res.status(200).json({
      message: userMassage.success.removeUser,
      removeUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};
