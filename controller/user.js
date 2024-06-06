const { userMassage } = require("../config/message");
const { roleByName } = require("../config/variables");

module.exports.getRole = async = (req,res) => {
  try {
    const findRole =  req.user.roleId;
    const role = roleByName[findRole]

    return res.status(200).json({
        message: userMassage.success.profileRetrieved,
        profile: role,
    });
  } catch (error) {
    return res.status(404).json({ message: userMassage.error.genericError });
  }
};