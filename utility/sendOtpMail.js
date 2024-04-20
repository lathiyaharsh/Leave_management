const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const path = require('path');
const fs = require('fs');

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

    const viewsDirectory = path.resolve(__dirname, "../views");
    const filePath = path.join(viewsDirectory, "forgetOtp.hbs");

    const source = fs.readFileSync(filePath, "utf-8");
    const template = handlebars.compile(source);

    const { email, otp } = otpDetails;
    const htmlToSend = template({ email, otp });

    const mail = await transporter.sendMail({
      from: process.env.EMAILPASSWORD, // sender address
      to: `${email}`, // list of receivers
      subject: "Forget password", // Subject line
      text: "Hello User ", // plain text body
      html: htmlToSend, // html body
    });

    if (mail) return { valid: true, res: "Mail send successfully." };
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendMail;
