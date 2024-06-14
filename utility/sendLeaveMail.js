require("dotenv").config();
const cron = require("node-cron");
const handlebars = require("handlebars");
const fs = require("fs");
const { roleByName } = require("../config/variables");
const { transporter } = require("./mail");
const { findAllLeaveRequest } = require("../service/leaveRequest");
const { findUser } = require("../service/user");

const getPendingLeave = async () => {
  try {
    const PendingLeaves = await findAllLeaveRequest({ status: "Pending" });
    return PendingLeaves;
  } catch (error) {
    console.log(error);
  }
};
const findUserByReqId = async (requestToId) => {
  try {
    const attributes = {
      exclude: ["password"],
    };
    const id = requestToId;
    const userDetails = await findUser({ id }, attributes);
    return userDetails;
  } catch (error) {
    console.log(error);
  }
};

const sendReminderEmail = async (PendingLeaves) => {
  try {
    for (const leave of PendingLeaves) {
      const requestedBy = await findUser({ id });
      const userDetail = await findUserByReqId(leave.requestToId);

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
    return { valid: false, res: "Mail not send successfully." };
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
