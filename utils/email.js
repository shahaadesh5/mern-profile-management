const nodemailer = require("nodemailer");
require('dotenv').config();
const inLineCss = require('nodemailer-juice');

exports.sendEmail = async (options) => {

    let {
        email,
        subject,
        content,
        attachments,
        bcc
    } = options;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.NODEMAILER_EMAIL, // generated ethereal user
          pass: process.env.NODEMAILER_PASS, // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
      });
    
    transporter.use('compile', inLineCss());

    let info = await transporter.sendMail({
        from: '"Profile Management Support" <shahaadesh5@gmail.com>', // sender address
        to: email, // list of receivers
        bcc,
        subject, // Subject line
        text: "", // plain text body
        html: content, // e.g. "<b>Hello world?</b>", // html body
        attachments
    });

    console.log("Email sent: %s", info.messageId);
}