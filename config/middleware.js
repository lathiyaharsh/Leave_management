require("dotenv").config();
const jwt = require("jsonwebtoken");
const { userMassage } = require("./message");
const { user } = require("../model/user");
const { roleByName } = require('./variables')

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
          
          const userDetails = await getUser(decoded.userDetails);

          if (userDetails == null)
            return res
              .status(401)
              .json({ message: userMassage.error.unauthorized });
          req.user = userDetails;
  
          if (role) {
            if ( roleByName[userDetails.roleId ] !== role) {
              return res.status(403).json({ message: `Forbidden: ${role} access required` });
            }
          }
  
          next();
        } catch (error) {
            console.log(error);
          return res.status(401).json({ message: userMassage.error.unauthorized });
        }
      });
    };
  };
  

const getUser = async (data) => {
  try {
    const { email , name , id } = data;
    const getUserDetails = await user.findOne({
      where: { email , name , id },
      attributes: { exclude: ["password"] },
    });

    return getUserDetails;
  } catch (error) {
    console.log(error);
  }
};

module.exports = verifyToken;
