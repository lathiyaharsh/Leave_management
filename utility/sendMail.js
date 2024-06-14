const handlebars = require("handlebars");
const fs = require("fs");
const { transporter } = require("./mail");

const sendMail = async (emailDetails) => {
  try {
    const filePath = "views/signupMail.hbs";
    const source = fs.readFileSync(filePath, "utf-8");
    const template = handlebars.compile(source);

    const { name, email, password } = emailDetails;
    const htmlToSend = template({ name, email, password });

    const mail = await transporter.sendMail({
      from: process.env.EMAILPASSWORD,
      to: email,
      subject: "Welcome To LMS",
      text: "Hello User ",
      html: htmlToSend,
    });

    if (mail) return { valid: true, res: "Mail send successfully." };
  } catch (error) {
    console.log(error);
    return { valid: false, res: "Mail not send successfully." };
  }
};

module.exports = sendMail;
