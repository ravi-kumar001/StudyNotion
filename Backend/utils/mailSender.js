const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, subject, html) => {
  try {
    console.log(doc);

    // we can seperate this code in utils folder
    // create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_MASTER_PASSWORD,
      },
    });

    // Send Email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: `${email}`,
      subject: `${subject}`,
      html: `${html}`,
    });
    console.log(info);
  } catch (error) {
    console.error(error);
  }
};

module.exports = { mailSender };
