const cron = require("node-cron");
const leave = require("../model/leaveRequest");
const { user } = require("../model/user");
const handlebars = require("handlebars");
const fs = require("fs");
const getPendingLeave = async () => {
  const PendingLeaves = await leave.findAll({ where: { status: "Pending" } });
  return PendingLeaves;
};
const findUser = async (requestToId) => {
  const userDetails = await user.findOne({ where: { id: requestToId } }); 
  return userDetails;
};
const sendReminderEmail = async (PendingLeaves) => {
  for (const leave of PendingLeaves) {
    const userDetail = await findUser(leave.requestToId);
    console.log(userDetail);
    const viewsDirectory = path.resolve(__dirname, "../views");
    const filePath = path.join(viewsDirectory, "leaveMail.hbs");

    const source = fs.readFileSync(filePath, "utf-8");
    const template = handlebars.compile(source);
    const emailTemp = template({
      name: userDetail.name,
      leaveType: leave.leaveType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
    });
    const mailOptions = {
      to: userDetail.email,
      subject: "Leave Reminder",
      html:emailTemp
    };
    await sendEmail(mailOptions);
  }
};
// cron.schedule("0 11 * * *", async () => {
//   const PendingLeaves = await getPendingLeave();
//   await sendReminderEmail(PendingLeaves);
// });
cron.schedule("57 10 * * *", async () => {
  const PendingLeaves = await getPendingLeave();
  await sendReminderEmail(PendingLeaves);
});
