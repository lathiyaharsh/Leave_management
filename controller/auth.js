require("dotenv").config();
const jwt = require("jsonwebtoken");
const { userMassage } = require("../config/message");
const sendOtpMail = require("../utility/sendOtpMail");
const bcrypt = require("bcrypt");
const { roleByName } = require("../config/variables");
const { findUserByEmail, updateUser } = require("../service/user");
const {
  deleteExpiredOTP,
  generateOTP,
  createOTP,
  findOTP,
} = require("../service/otp");

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await findUserByEmail(email);

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
        ? await jwt.sign({ data: userDetails }, process.env.SECRETKEY, {
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

    const findExistingOtp = await findOTP({ email });
    if (findExistingOtp) {
      await deleteExpiredOTP();
      return res.status(400).json({ message: userMassage.error.otpTime });
    }

    const findUser = await findUserByEmail(email);
    if (!findUser)
      return res.status(404).json({ message: userMassage.error.userNotFound });

    if (findUser) {
      const { id, email, roleId } = findUser;
      const otp = generateOTP();
      const otpDetails = {
        userId: id,
        email,
        otp,
        roleId,
      };

      const createNewOtp = await createOTP(otpDetails);
      if (!createNewOtp)
        return res.status(400).json({ message: userMassage.error.otp });

      const sendOtpEmail = await sendOtpMail(otpDetails);

      if (!sendOtpEmail.valid) {
        setTimeout(deleteExpiredOTP, 60 * 3000);
        return res.status(201).json({ message: userMassage.error.otpTime });
      }
      setTimeout(deleteExpiredOTP, 60 * 3000);
      return res.status(201).json({ message: userMassage.success.otp });
    }
  } catch (error) {
    //second time
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

    const findUserDetails = await findOTP({ email });
    if (!findUserDetails) {
      return res.status(400).json({ message: userMassage.error.sendOtp });
    }
    {
      const { userId, email, roleId } = findUserDetails;
      const role = roleByName[roleId];
      const userDetails = {
        userId,
        otp,
        email,
        role,
      };

      if (findUserDetails.otp === otp) {
        const token = await jwt.sign(
          { data: userDetails },
          process.env.SECRETKEY,
          {
            expiresIn: "2m",
          }
        );
        res.cookie("jwt", token, { httpOnly: true });
        return res.status(200).json({
          message: userMassage.success.otpVerify,
          token,
        });
      }
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
    const updatePassword = {
      password: await bcrypt.hash(password, 10),
    };

    const updateDetails = await updateUser(updatePassword, { id });

    if (!updateDetails)
      return res.status(400).json({ message: userMassage.error.update });

    return res.status(200).json({ message: userMassage.success.update });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: userMassage.error.genericError });
  }
};
