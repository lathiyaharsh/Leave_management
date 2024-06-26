const handlebars = require("handlebars");
const fs = require("fs");
const { transporter } = require("./mail");

const sendMail = async (otpDetails) => {
  try {
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
    return { valid: false, res: "Mail not send successfully." };
  }
};

module.exports = sendMail;
