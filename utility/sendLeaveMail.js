require("dotenv").config();
const cron = require("node-cron");
const leave = require("../model/leaveRequest");
const { user } = require("../model/user");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { roleByName } = require("../config/variables");

const getPendingLeave = async () => {
  try {
    const PendingLeaves = await leave.findAll({ where: { status: "Pending" } });
    return PendingLeaves;
  } catch (error) {
    console.log(error);
  }
};
const findUser = async (requestToId) => {
  try {
    const userDetails = await user.findOne({
      where: { id: requestToId },
      attributes: {
        exclude: ["password"],
      },
    });
    return userDetails;
  } catch (error) {
    console.log(error);
  }
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

      const filePath = "views/leaveMail.hbs";
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
        from: process.env.EMAILFROM,
        to: userDetail.email,
        subject: "Leave Request",
        text: "Hello Manager ",
        html: emailTemp,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

cron.schedule("0 17 * * *", async () => {
  try {
    const PendingLeaves = await getPendingLeave();
    await sendReminderEmail(PendingLeaves);
  } catch (error) {
    console.log(error);
  }
});

cron.schedule("0 9 * * *", async () => {
  try {
    const PendingLeaves = await getPendingLeave();
    await sendReminderEmail(PendingLeaves);
  } catch (error) {
    console.log(error);
  }
});

