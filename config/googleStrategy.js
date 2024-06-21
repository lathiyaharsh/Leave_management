require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const { user } = require("../model/user");
const bcrypt = require("bcrypt");
const { role } = require("./variables");
const { findUser } = require("../service/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: "/api/v1/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        const email = profile.emails[0].value;
        const checkEmail = await findUser({ email });
        if (checkEmail) {
          cb(null, checkEmail);
        } else {
          const pass = `${profile.emails[0].value}@123`;

          const userDetails = {
            name: profile.displayName,
            email: profile.emails[0].value,
            gender: "male",
            image: profile.photos[0].value,
            phone: 1234568912,
            address: "India",
            password: await bcrypt.hash(pass, 10),
            roleId: role.student,
          };
          const userData = await user.create(userDetails);
          if (!userData) {
            return cb(null, false);
          }
         
  
          cb(null, { userData });
        }
      } catch (error) {
        console.log(error);
      }
    }
  )
);

module.exports = GoogleStrategy;
