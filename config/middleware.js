require("dotenv").config();
const jwt = require("jsonwebtoken");
const { userMassage } = require("./message");
const { user } = require("../model/user");

const verifyToken = async (req, res, next) => {
  const token = req.cookies["jwt"];
  if (!token)
    return res.status(403).json({ message: userMassage.error.tokenMissing });

  jwt.verify(token, process.env.SECRETKEY, async (err, decoded) => {
    try {
      if (err)
        return res
          .status(401)
          .json({ message: userMassage.error.unauthorized });
      
          
      const userDetails  = await getUser(decoded.userDetails.id);  
      req.user = userDetails;
      next();
    } catch (error) {}
  });
};

const getUser = async (id) => {
  try {
    const getUserDetails = await user.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    return getUserDetails;
  } catch (error) {
    console.log(error);
  }
};

module.exports = verifyToken;
