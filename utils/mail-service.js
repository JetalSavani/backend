const nodemailer = require('nodemailer');
require("dotenv").config()
module.exports = {

    mailService: (email, otp) => {

        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        let mailDetails = {
            from: 'xyz@gmail.com',
            to: 'abc@gmail.com',
            subject: 'Test mail',
            text: 'Node.js testing mail for GeeksforGeeks'
        };

        mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
                console.log('Error Occurs');
            } else {
                console.log('Email sent successfully');
            }
        })
    }
}