require("dotenv").config();
const jwt = require("jsonwebtoken");
const { userMassage } = require("../config/message");
const { roleByName, role } = require("../config/variables");
const fs = require("fs");
const { findUser } = require("../service/user");

const verifyToken = (role) => {
  return async (req, res, next) => {
    const token = req.cookies["jwt"];

    if (!token)
      return res.status(403).json({ message: userMassage.error.tokenMissing });

    jwt.verify(token, process.env.SECRETKEY, async (err, decoded) => {
      try {
        if (err)
          return res
            .status(401)
            .json({ message: userMassage.error.unauthorized });

        const userDetails = await getUser(decoded.data);
        if (userDetails == null && !userDetails)
          return res
            .status(401)
            .json({ message: userMassage.error.unauthorized });
        req.user = userDetails;

        if (role && role.length > 0) {
          userRole = roleByName[userDetails.roleId];
          if (!role.includes(userRole)) {
            if (req.file) await fs.unlinkSync(req.file.path);
            return res.status(403).json({
              message: `Forbidden: ${role.join(" or ")} access required`,
            });
          }
        }

        next();
      } catch (error) {
        console.log(error);
        return res
          .status(401)
          .json({ message: userMassage.error.unauthorized });
      }
    });
  };
};

const getUser = async (data) => {
  try {
    let id;
    data?.userId ? (id = data?.userId) : (id = data?.id);
    const roleId = role[data.role];
    const attributes = { exclude: ["password"] };
    const where = { roleId, id };
    const getUserDetails = await findUser(where, attributes);
    return getUserDetails;
  } catch (error) {
    console.log(error);
  }
};

module.exports = verifyToken;
