const { contactUsEmail } = require("../mail/templates/contactFormRes"); // Import the contact form email template
const mailSender = require("../utils/mailSender"); // Import the mail sender utility
require("dotenv").config(); // Load environment variables from the .env file

// Controller for handling contact us form submissions
exports.contactUsController = async (req, res) => {
  // Extract details from the request body
  const { email, firstname, lastname, message, phoneNo, countrycode } = req.body;
  console.log(req.body); // Log the request body for debugging

  try {
    // Send email to the user confirming the submission
    const emailRes = await mailSender(
      email,
      "Your Data sent successfully",
      contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode),
    );

    // Get the admin email from environment variables
    const admin = process.env.ADMIN_EMAIL;

    // Send email to the admin with the details from the form submission
    const adminMailRes = await mailSender(admin, "Mail from student", `Student: ${firstname} ${lastname} \nMessage: ${message} \nStudent Email: ${email}`);
    console.log("Email Response: ", emailRes); // Log the email response for debugging

    // Return a success response
    return res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.log("Error: ", error); // Log the error
    console.log("Error message: ", error.message); // Log the error message

    // Return a failure response
    return res.json({
      success: false,
      message: "Something went wrong...",
    });
  }
};
