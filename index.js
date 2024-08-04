const express = require("express");
const app = express(); // Initialize Express application

const userRoutes = require("./routes/User"); // Import user routes
const profileRoutes = require("./routes/Profile"); // Import profile routes
const paymentsRoutes = require("./routes/Payments"); // Import payment routes
const courseRoutes = require("./routes/Course"); // Import course routes
const contactRoutes = require("./routes/Contact"); // Import contact routes

const database = require("./config/database"); // Import database configuration
const cookieParser = require("cookie-parser"); // Import cookie-parser middleware
const cors = require("cors"); // Import CORS middleware
const { cloudinaryConnect } = require("./config/cloudinary"); // Import cloudinary configuration
const fileUpload = require("express-fileupload"); // Import file upload middleware
const dotenv = require("dotenv"); // Import dotenv for environment variables
dotenv.config(); // Load environment variables from .env file

const PORT = process.env.PORT || 4000; // Define the server port

database.connect(); // Connect to the database

app.use(express.json()); // Middleware to parse JSON requests
app.use(cookieParser()); // Middleware to parse cookies
app.use(
  cors({
    origin: "https://frontend-studynotion.onrender.com/", // Allow requests from this origin
    credentials: true, // Enable credentials (cookies, authorization headers)
  })
);

app.use(
  fileUpload({
    useTempFiles: true, // Use temporary files for file uploads
    tempFileDir: "/tmp", // Temporary directory for file uploads
  })
);

cloudinaryConnect(); // Connect to Cloudinary

// Define routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentsRoutes);
app.use("/api/v1/contact", contactRoutes); // Add contact routes

// Root route for server status check
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
