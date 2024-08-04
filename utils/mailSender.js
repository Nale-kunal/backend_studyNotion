const nodemailer = require("nodemailer");

// Function to send an email using Nodemailer
const mailSender = async (email, title, body) => {
    try {
        // Create a transporter object with SMTP server details
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        // Send the email
        let info = await transporter.sendMail({
            from: "StudyNotion - by Tushar",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });
        
        console.log(info); // Log the response for debugging purposes
        return info; // Return the response
    } catch (error) {
        console.log(error.message); // Log any errors
        throw error; // Rethrow the error to handle it elsewhere if needed
    }
};

module.exports = mailSender;
