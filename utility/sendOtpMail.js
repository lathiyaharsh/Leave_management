const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");

const sendMail = async (otpDetails) => {
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

    const filePath = "views/forgetOtp.hbs";
    const source = fs.readFileSync(filePath, "utf-8");
    const template = handlebars.compile(source);

    const { email, otp } = otpDetails;
    const htmlToSend = template({ email, otp });

    const mail = await transporter.sendMail({
      from: process.env.EMAILPASSWORD,
      to: email,
      subject: "Forget password",
      text: "Hello User ",
      html: htmlToSend,
    });

    if (mail) return { valid: true, res: "Mail send successfully." };
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendMail;
