const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const { user } = require("../model/user");
const { transporter } = require("./mail");
const sendLeaveUpdate = async (emailDetails) => {
  try {

    const filePath = "views/sendLeaveUpdate.hbs";
    const source = fs.readFileSync(filePath, "utf-8");
    const template = handlebars.compile(source);

    const { userId, startDate, endDate, leaveType, status } = emailDetails;

    const userEmail = await user.findOne({ where: { id: userId } });

    const { email, name } = userEmail;

    const htmlToSend = template({
      name,
      startDate,
      endDate,
      leaveType,
      status,
    });

    const mail = await transporter.sendMail({
      from: process.env.EMAILPASSWORD,
      to: email,
      subject: "Leave Update",
      text: "Hello User ",
      html: htmlToSend,
    });

    if (mail) return { valid: true, res: "Mail send successfully." };
  } catch (error) {
    console.log(error);
    return { valid: false, res: "Mail not  send successfully." };
  }
};

module.exports = sendLeaveUpdate;
