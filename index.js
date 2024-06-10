require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const port = process.env.PORT;
const passport = require("passport");
const GoogleStrategy = require("./config/googleStrategy");
const session = require("express-session");
const cors = require("cors");

require("./model/index");

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

app.set('views',path.join(__dirname,'views'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    name: "leaveManagement",
    secret: process.env.SECRETKEY,
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

// app.use("/", require("./routes/index"));
// app.use("/admin", require("./routes/admin"));
// app.use("/hod", require("./routes/hod"));
// app.use("/faculty", require("./routes/faculty"));

app.use('/api/v1',require("./routes/index"));

app.listen(port, (err) => {
  err ? console.log("Server error") : console.log(`Server Started  On ${port}`);
});
