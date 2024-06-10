require("dotenv").config();
const jwt = require("jsonwebtoken");
const { userMassage } = require("../config/message");
const otpModel = require("../model/otp");
const sendOtpMail = require("../utility/sendOtpMail");
const { Sequelize } = require("sequelize");
const { user } = require("../model/user");
const bcrypt = require("bcrypt");
const { roleByName } = require("../config/variables");
const { checkUser, deleteFile, findUserId } = require("../service/user");

function generateOTP() {
  try {
    let digits = "0123456789";
    let OTP = "";
    let len = digits.length;
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * len)];
    }

    return OTP;
  } catch (error) {
    console.log(error);
  }
}

async function deleteExpiredOTP() {
  try {
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    await otpModel.destroy({
      where: {
        createdAt: {
          [Sequelize.Op.lt]: threeMinutesAgo,
        },
      },
    });
    console.log("Expired OTPs deleted successfully.");
  } catch (error) {
    console.error("Error deleting expired OTPs:", error);
  }
}

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

module.exports.forgetPassword = async (req, res) => {
  try {
    if (!req.body)
      return res.status(400).json({ message: userMassage.error.fillDetails });

    const { email } = req.body;

    const findUser = await findUserId(email);
    if (!findUser)
      return res.status(404).json({ message: userMassage.error.userNotFound });

    if (findUser) {
      const { id , email , roleId } = findUser;
      const otp = generateOTP();
      const otpDetails = {
        userId:id,
        email,
        otp,
        roleId
      };
      const createOtp = await otpModel.create(otpDetails);

      if (!createOtp)
        return res.status(400).json({ message: userMassage.error.otp });

      const sendOtpEmail = await sendOtpMail(otpDetails);

      if (sendOtpEmail.valid) setTimeout(deleteExpiredOTP, 60 * 3000);
      return res.status(201).json({ message: userMassage.success.otp });
    }
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: userMassage.error.otpTime });
    }
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const findOtp = await otpModel.findOne({ where: { email } });
    
    if (findOtp.otp === otp) {
      const token = await jwt.sign({ findOtp }, process.env.SECRETKEY, {
        expiresIn: "1h",
      });
      res.cookie("verifyOtp", token, { httpOnly: true });
      return res.status(200).json({
        message: userMassage.success.otpVerify,
        token,
      });
    }

    return res.status(400).json({ message: userMassage.error.otpVerify });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { id } = req.user;
    console.log(id, password);
    const updatePassword = {
      password: await bcrypt.hash(password, 10),
    };

    const updateDetails = await user.update(updatePassword, {
      where: { id },
    });

    if (!updateDetails)
      return res.status(400).json({ message: userMassage.error.update });

    return res.status(200).json({ message: userMassage.success.update });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};
