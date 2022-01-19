const nodeMailer = require("nodemailer");
const {models} = require("mongoose");

const sendEmail = async function (options){
    const transport = nodeMailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    });
    const mailOptions = {
        from: "Serdar <serdar1901@gmail.com>",
        to: options.email,
        subject: options.subject,
        text : options.text
    }

    await transport.sendMail(mailOptions);
}
module.exports = sendEmail;