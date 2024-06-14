const { Sequelize  } = require("sequelize");
const otpModel = require("../model/otp");
module.exports.generateOTP = () => {
  try {
    let digits = "123456789";
    let OTP = "";
    let len = digits.length;
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * len)];
    }
    return OTP;
  } catch (error) {
    console.log(error);
  }
};

module.exports.deleteExpiredOTP = async () => {
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
};

module.exports.createOTP = async (otpDetails) => {
  try {
    const createOtp = await otpModel.create(otpDetails);
    return createOtp;
  } catch (error) {
    console.log(error);
    throw error
  }
};

module.exports.findOTP = async (whereCondition) => {
  try {
    const findOtp = await otpModel.findOne({ where: whereCondition });
    if (!findOtp) return false;
    return findOtp;
  } catch (error) {
    console.log(error);
    throw error
  }
};
