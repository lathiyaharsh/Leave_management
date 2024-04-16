const fs = require("fs");
require("dotenv").config();
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");
const db = require("../config/sequelize");
const userLeave = require("../model/userLeave");
const { userMassage } = require("../config/message");
const leaveRequest = require("../model/leaveRequest");
const { user, imgPath, validateData } = require("../model/user");
const { role, roleByName, leaveDetails } = require("../config/variables");
const sendMail = require("../utility/sendMail");

// module.exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const query = `SELECT * FROM admin WHERE email ='${email}';`;

//     db.query(query, { type: Sequelize.QueryTypes.SELECT })
//       .then(async (admins) => {
//         if (admins.length == 0)
//           return res
//             .status(404)
//             .json({ message: userMassage.error.userNotFound });

//         const isValidPassword = await bcrypt.compare(
//           password,
//           admins[0].password
//         );

//         {
//           const { id, name, email, roleId } = admins[0];
//           const role = roleByName[roleId];
//           const userDetails = {
//             id,
//             name,
//             email,
//             role,
//           };

//           const token = isValidPassword
//             ? await jwt.sign({ userDetails }, process.env.SECRETKEY, {
//                 expiresIn: "1h",
//               })
//             : null;

//           if (isValidPassword) {
//             res.cookie("jwt", token, { httpOnly: true });
//             return res.status(200).json({
//               message: userMassage.success.loginSuccess,
//               token,
//             });
//           }
//         }

//         return res
//           .status(400)
//           .json({ message: userMassage.error.wrongPassword });
//       })
//       .catch((err) => {
//         console.error("Error executing query:", err);
//       });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: userMassage.error.genericError });
//   }
// };

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

module.exports.registerHod = async (req, res) => {
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
      roleId: role.hod,
    };

    const createUser = await user.create(newUser);

    if (!createUser)
      return res.status(400).json({ message: userMassage.error.signUperror });

    const getUserId = await findUserId(email);
    await this.setLeaveHod(req, res, getUserId);
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

module.exports.setLeaveHod = async (req, res, userId) => {
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
