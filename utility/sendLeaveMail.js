require('dotenv').config();
const cron = require("node-cron");
const leave = require("../model/leaveRequest");
const { user } = require("../model/user");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { roleByName } = require("../config/variables");

const getPendingLeave = async () => {
  const PendingLeaves = await leave.findAll({ where: { status: "Pending" } });
  return PendingLeaves;
};
const findUser = async (requestToId) => {
  const userDetails = await user.findOne({
    where: { id: requestToId },
    attributes: {
      exclude: ["password"],
    },
  });
  return userDetails;
};

const sendReminderEmail = async (PendingLeaves) => {
  try {
    for (const leave of PendingLeaves) {
      const requestedBy = await user.findOne({ where: { id: leave.userId } });

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAILFROM,
          pass: process.env.EMAILPASSWORD,
        },
      });

      const userDetail = await findUser(leave.requestToId);

      const viewsDirectory = path.resolve(__dirname, "../views");
      const filePath = path.join(viewsDirectory, "leaveMail.hbs");

      const source = fs.readFileSync(filePath, "utf-8");
      const template = handlebars.compile(source);

      const { id, leaveType, startDate, endDate, reason } = leave;
      const { userName, userId, roleId } = requestedBy;
      const emailTemp = template({
        name: userDetail.name,
        requestedByName: userName,
        requestedById: userId,
        requestedBy: roleByName[roleId],
        leaveId: id,
        leaveType: leaveType,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
      });

      const mail = await transporter.sendMail({
        from: process.env.EMAILFROM, // sender address
        to: `${userDetail.email}`, // list of receivers
        subject: "Leave Request", // Subject line
        text: "Hello Manager ", // plain text body
        html: emailTemp, // html body
      });
    }
  } catch (error) {
    console.log(error);
  }
};
cron.schedule("0 10 * * *", async () => {
  const PendingLeaves = await getPendingLeave();
  await sendReminderEmail(PendingLeaves);
});
