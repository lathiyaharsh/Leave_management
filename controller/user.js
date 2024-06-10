const fs = require("fs");
const { userMassage } = require("../config/message");
const { roleByName } = require("../config/variables");
require("dotenv").config();
const path = require("path");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { imgPath, validateData } = require("../model/user");
const { role, leaveDetails, pagination } = require("../config/variables");
const sendMail = require("../utility/sendMail");

const {
  checkUser,
  deleteFile,
  findUser,
  findAllUsers,
  countUsers,
  deleteUser,
  createUser,
  updateUser,
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

    const userInfo = await findUser({ id });
    if (!userInfo) {
      return res.status(404).json({ message: userMassage.error.userNotFound });
    }
    const { image } = userInfo;
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
    if (!req.file)
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
    const createNewUserLeave = await createUserLeave(studentLeave);
    !createNewUserLeave
      ? (userError += userMassage.error.userLeave)
      : (userError += userMassage.success.userLeave);

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
      .json({ message: userMassage.success.signUpSuccess, result: userError });
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
    const userDetails = await findUser({ id });

    if (!userDetails)
      return res.status(400).json({ message: userMassage.error.userNotFound });
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

    const editUser = await updateUser(req.body, { id });

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

    const editUser = await updateUser(updatedUser, { id: userId });

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

module.exports.userList = async (req, res) => {
  try {
    const { page, search, limit, roleType } = req.query;

    const roleId = roleType || role[roleType] || role.student;
    if (search && search.trim()) {
      const whereCondition = {
        roleId,
        name: {
          [Op.like]: `%${search}%`,
        },
      };
      const attributes = {
        exclude: ["password"],
      };

      const searchResults = await findAllUsers(whereCondition, attributes);

      return res.status(200).json({
        message: userMassage.success.studentList,
        searchResults,
      });
    }
    const pageCount = page || pagination.pageCount;
    const limitDoc = parseInt(limit) || parseInt(pagination.limitDoc);
    const totalUser = await countUsers({ roleId });
    const maxPage = totalUser <= limitDoc ? 1 : Math.ceil(totalUser / limitDoc);

    if (pageCount > maxPage)
      return res
        .status(400)
        .json({ message: `There are only ${maxPage} page` });

    const skip = parseInt((pageCount - 1) * limitDoc);

    const attributes = {
      exclude: ["password"],
    };
    const whereCondition = {
      roleId,
    };

    const userList = await findAllUsers(
      whereCondition,
      attributes,
      skip,
      limitDoc
    );

    return res.status(200).json({
      message: userMassage.success.fetch,
      userList,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: bookMassage.error.genericError });
  }
};
