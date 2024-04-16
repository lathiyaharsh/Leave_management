require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const port = process.env.PORT;
require("./model/index");

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", require("./routes/index"));
app.use("/admin", require("./routes/admin"));
app.use("/hod", require("./routes/hod"));
app.use("/faculty", require("./routes/faculty"));

app.listen(port, (err) => {
  err ? console.log("Server error") : console.log(`Server Started  On ${port}`);
});
