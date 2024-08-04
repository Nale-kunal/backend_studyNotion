const RatingAndReviews = require("../models/RatingAndReview");
const Course = require("../models/Course");
const mongoose = require("mongoose"); // Import mongoose

// Create a rating and review for a course
exports.createRating = async (req, res) => {
  try {
    const { courseId, rating, review } = req.body; // Extract courseId, rating, and review from request body
    const userId = req.user.id; // Extract userId from request user object

    // Find the course and check if the user is enrolled
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    // If the user is not enrolled in the course, return an error
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in course",
      });
    }

    // Check if the user has already reviewed the course
    const alreadyReviewed = await RatingAndReviews.findOne({
      user: userId,
      course: courseId,
    });

    // If the course is already reviewed by the user, return an error
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course is already reviewed by user",
      });
    }

    // Create a new rating and review
    const ratingReview = await RatingAndReviews.create({
      course: courseId,
      user: userId,
      rating,
      review,
    });

    // Update the course with the new rating and review
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );

    console.log(updatedCourseDetails);

    // Return success response with the new rating and review
    return res.status(200).json({
      success: true,
      message: "Rating and review successfully added",
      ratingReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get the average rating for a course
exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body; // Extract courseId from request body

    // Aggregate the average rating for the course
    const result = await RatingAndReviews.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    // If there are ratings, return the average rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    // If no ratings, return a message indicating no ratings
    return res.status(200).json({
      success: true,
      message: "Average rating is 0, no rating given till now",
      averageRating: 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all ratings and reviews
exports.getAllRating = async (req, res) => {
  try {
    // Find all reviews and sort them by rating in descending order
    
    const allReviews = await RatingAndReviews.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    // Return success response with all reviews
    return res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      allReviews,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
