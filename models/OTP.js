const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const { otpTemplate } = require("../mail/templates/emailVerificationTemplate");

// Define the schema for the OTP model
const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 5 * 60, // Expires in 5 minutes
    },
});

// Function to send verification email
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Email From StudyNotion", otpTemplate(otp));
        console.log("Email sent successfully", mailResponse);
    } catch (error) {
        console.log("Error occurred while sending email", error);
        throw error;
    }
}

// Pre-save hook to send verification email before saving OTP document
OTPSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
});

// Export the OTP model
module.exports = mongoose.model("OTP", OTPSchema);
