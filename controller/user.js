const { userMassage } = require("../config/message");
const { roleByName } = require("../config/variables");
const fs = require("fs");
require("dotenv").config();
const path = require("path");
const bcrypt = require("bcrypt");
const { Op, Sequelize } = require("sequelize");
const userLeave = require("../model/userLeave");
const { user, imgPath, validateData } = require("../model/user");
const { role, leaveDetails, pagination } = require("../config/variables");
const sendMail = require("../utility/sendMail");
const moment = require("moment");
const sendLeaveUpdate = require("../utility/sendLeaveUpdate");
const {
  checkUser,
  deleteFile,
  findUserId,
  deleteUser,
  createUser,
} = require("../service/user");
const { createUserLeave } = require("../service/userLeave");

module.exports.getRole = async = (req, res) => {
  try {
    const findRole = req.user.roleId;
    const role = roleByName[findRole];

    return res.status(200).json({
      message: userMassage.success.profileRetrieved,
      profile: role,
    });
  } catch (error) {
    return res.status(404).json({ message: userMassage.error.genericError });
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

    const removeUser = await deleteUser({ id });

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
    let roleId = 4;
    if (req?.user?.roleId === 1) {
      roleId = req.body.role;
    }
    if (req?.user?.roleId === 2 && req.body?.role != 1) {
      roleId = req.body.role;
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
      roleId,
    };

    const createNewUser = await createUser(newUser);
    //const createUser = await user.create(newUser);

    if (!createNewUser)
      return res.status(400).json({ message: userMassage.error.signUpError });

    const {
      totalLeave,
      availableLeave,
      usedLeave,
      academicYear,
      totalWorkingDays,
      attendancePercentage,
    } = leaveDetails.student;

    const studentLeave = {
      userId: createNewUser.id,
      totalLeave,
      availableLeave,
      usedLeave,
      academicYear,
      totalWorkingDays,
      attendancePercentage,
    };

    let userError = "";
    //const createUserLeave = await userLeave.create(studentLeave);
    const createNewUserLeave = await createUserLeave(studentLeave);
    if (!createNewUserLeave) {
      userError = userMassage.error.userLeave;
    }
    const emailDetails = {
      name,
      email,
      password: req.body.password,
    };
    const sendEmail = await sendMail(emailDetails);
    !sendEmail.valid
      ? (userError += userMassage.error.mail)
      : (userError += userMassage.success.mail);
    return res
      .status(201)
      .json({ message: userMassage.success.signUpSuccess, mail: userError });
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

    const {
      totalLeave,
      availableLeave,
      usedLeave,
      academicYear,
      totalWorkingDays,
      attendancePercentage,
    } = leaveDetails.hod;

    const studentLeave = {
      userId: createUser.id,
      totalLeave,
      availableLeave,
      usedLeave,
      academicYear,
      totalWorkingDays,
      attendancePercentage,
    };

    let userError = "";
    const createUserLeave = await userLeave.create(studentLeave);
    if (!createUserLeave) {
      userError = userMassage.error.userLeave;
    }

    const emailDetails = {
      name,
      email,
      password: req.body.password,
    };

    const sendEmail = await sendMail(emailDetails);
    !sendEmail.valid
      ? (userError += userMassage.error.mail)
      : (userError += userMassage.success.mail);

    return res
      .status(201)
      .json({ message: userMassage.success.signUpSuccess, mail: userError });
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

    const {
      totalLeave,
      availableLeave,
      usedLeave,
      academicYear,
      totalWorkingDays,
      attendancePercentage,
    } = leaveDetails.faculty;

    const studentLeave = {
      userId: createUser.id,
      totalLeave,
      availableLeave,
      usedLeave,
      academicYear,
      totalWorkingDays,
      attendancePercentage,
    };

    let userError = "";
    const createUserLeave = await userLeave.create(studentLeave);
    if (!createUserLeave) {
      userError = userMassage.error.userLeave;
    }

    const emailDetails = {
      name,
      email,
      password: req.body.password,
    };
    const sendEmail = await sendMail(emailDetails);
    !sendEmail.valid
      ? (userError += userMassage.error.mail)
      : (userError += userMassage.success.mail);

    return res
      .status(201)
      .json({ message: userMassage.success.signUpSuccess, mail: userError });
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

module.exports.editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userDetails = await user.findByPk(id);
    const { image, email } = userDetails;
    const userRoleId = userDetails.roleId;
    const requesterRoleId = req.user.roleId;
    if (
      (userRoleId === 2 && requesterRoleId >= 2) ||
      (userRoleId === 3 && requesterRoleId === 3) ||
      (userRoleId === 1 && requesterRoleId >= 2)
    ) {
      return res.status(400).json({
        message:
          userMassage.error[
            userRoleId === 2
              ? "hodUpdateRole"
              : userRoleId === 3
                ? "facultyUpdateRole"
                : "adminUpdateRole"
          ],
      });
    }

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
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
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
//profile
module.exports.editProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userImage = req.user.image;
    const userEmail = req.user.email;

    if (userEmail != req.body.email) {
      const findUser = await checkUser(req.body.email);

      if (findUser) {
        await deleteFile(req.file);
        return res.status(400).json({
          message: userMassage.error.invalidEmail,
        });
      }
    }
    if (req.file) {
      const parsedUrl = new URL(userImage);
      const imagePath = parsedUrl.pathname;
      const fullPath = path.join(__dirname, "..", imagePath);
      await fs.unlinkSync(fullPath);

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      req.body.image = baseUrl + imgPath + "/" + req.file.filename;
    }

    const { name, email, gender, image, phone, address, department, div } =
      req.body;

    const updatedUser = {
      name,
      email,
      gender,
      image,
      phone,
      address,
      department,
      div,
    };

    const editUser = await user.update(updatedUser, {
      where: { id: userId },
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
