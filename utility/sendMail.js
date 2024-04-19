const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");

const sendMail = async (req, res, emailDetails) => {
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
    const filePath = path.join(viewsDirectory, "signupMail.hbs");

    const source = fs.readFileSync(filePath, "utf-8");
    const template = handlebars.compile(source);

    const { name, email, password } = emailDetails;
    const htmlToSend = template({ name, email, password });

    const mail = await transporter.sendMail({
      from: process.env.EMAILPASSWORD, // sender address
      to: `${email}`, // list of receivers
      subject: "Welcome To LMS", // Subject line
      text: "Hello Manager ", // plain text body
      html: htmlToSend, // html body
    });

    if (mail) return { valid: true, res: "Mail send successfully." };
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendMail;
