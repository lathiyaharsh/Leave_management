require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const port = process.env.PORT;
const leaveMails = require("./utility/sendLeaveMail");
const passport = require("passport");
const GoogleStrategy = require("./config/googleStrategy");
const session = require("express-session");

require("./model/index");

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    name: "harsh",
    secret: "harsh",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use("/", require("./routes/index"));
app.use("/admin", require("./routes/admin"));
app.use("/hod", require("./routes/hod"));
app.use("/faculty", require("./routes/faculty"));

app.listen(port, (err) => {
  err ? console.log("Server error") : console.log(`Server Started  On ${port}`);
});
