const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// Middleware to authenticate the user using JWT
exports.auth = async (req, res, next) => {
    try {
        // Extract token from cookies, body, or headers
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded);
            req.user = decoded;
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating token",
        });
    }
};

// Middleware to check if the user is a student
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for students only",
            });
        }
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again",
        });
    }
};

// Middleware to check if the user is an instructor
exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for instructors only",
            });
        }
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again",
        });
    }
};

// Middleware to check if the user is an admin
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Admin only",
            });
        }
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again",
        });
    }
};
