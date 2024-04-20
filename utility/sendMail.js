const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");

const sendMail = async (emailDetails) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAILFROM,
        pass: process.env.EMAILPASSWORD,
      },
    });

    const filePath = "views/signupMail.hbs";
    const source = fs.readFileSync(filePath, "utf-8");
    const template = handlebars.compile(source);

    const { name, email, password } = emailDetails;
    const htmlToSend = template({ name, email, password });

    const mail = await transporter.sendMail({
      from: process.env.EMAILPASSWORD,
      to: email,
      subject: "Welcome To LMS",
      text: "Hello Manager ",
      html: htmlToSend,
    });

    if (mail) return { valid: true, res: "Mail send successfully." };
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendMail;
