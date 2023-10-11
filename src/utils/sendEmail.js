// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');

module.exports = async (email, subj, txt) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: subj,
      text: txt,
    });

    console.log('EMAIL SENT SUCESSFULLY');
  } catch (error) {
    console.log('EMAIL NOT SENT');
    console.log(error);
  }
};
