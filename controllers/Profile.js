const Profile = require("../models/Profile");
const User = require("../models/User");
// const RatingAndReview = require("../models/RatingAndReview");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
// const Section = require("../models/Section");
// const Subsection = require("../models/SubSection");
// const cron = require('node-cron');
// const { deleteImageFromCloudinary } = require("../utils/imageUpload");
const {uploadImageToCloudinary} = require("../utils/imageUpload");
const {convertSecondsToDuration} = require("../utils/secToDuration");

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
        const id = req.user.id;

        // Check if required fields are provided
        if (!contactNumber || !gender || !id) {
            return res.status(400).json({
                success: false,
                message: "All fields required",
            });
        }

        // Find user details
        const userDetails = await User.findById(id);

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Find profile details
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // Update profile details
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;

        await profileDetails.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profileDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

// exports.deleteAccount = async (req, res) => {
    // try {
    //     const id = req.user.id;

    //     // Find user details
    //     const userDetails = await User.findById(id);

    //     if (!userDetails) {
    //         return res.status(404).json({
    //             success: false,
    //             message: "User not found",
    //         });
    //     }

    //     // Schedule account deletion in 5 days
    //     cron.schedule('0 0 */5 * *', async () => {
    //         if (userDetails.accountType === 'student') {
    //             // Delete all ratings and reviews by the student
    //             await RatingAndReview.deleteMany({ userId: id });
    //             // Delete all course progress records by the student
    //             await CourseProgress.deleteMany({ userId: id });
    //             // Remove the student from all courses they are enrolled in
    //             await Course.updateMany(
    //                 { studentsEnrolled: id },
    //                 { $pull: { studentsEnrolled: id } }
    //             );
    //         } else if (userDetails.accountType === 'instructor') {
    //             // Find all courses created by the instructor
    //             const courses = await Course.find({ instructor: id });
    //             for (const course of courses) {
    //                 // Find all sections in each course
    //                 const sections = await Section.find({ _id: { $in: course.sections } });
    //                 for (const section of sections) {
    //                     // Find all subsections in each section
    //                     const subsections = await Subsection.find({ section: section._id });
    //                     for (const subsection of subsections) {
    //                         // Delete video from Cloudinary
    //                         await deleteImageFromCloudinary(subsection.videoUrl);
    //                     }
    //                     // Delete all subsections in the section
    //                     await Subsection.deleteMany({ section: section._id });
    //                 }
    //                 // Delete all sections in the course
    //                 await Section.deleteMany({ _id: { $in: course.sections } });
    //             }
    //             // Delete all courses created by the instructor
    //             await Course.deleteMany({ instructor: id });
    //         }

    //         // Delete the user's profile
    //         await Profile.findByIdAndDelete(userDetails.additionalDetails);
    //         // Delete the user
    //         await User.findByIdAndDelete(id);
    //     });

    //     return res.status(200).json({
    //         success: true,
    //         message: "User account scheduled for deletion in 5 days",
    //     });
    // } catch (error) {
    //     return res.status(500).json({
    //         success: false,
    //         error: error.message,
    //     });
    // }

    exports.deleteAccount = async (req, res) => {
      try{
          const id = req.user.id;
  
          const userDetails = await User.findById(id);
  
          if(!userDetails){
              return res.status(404).json({
                  success: false,
                  message: "User not found",
              });
          }
  
          await Profile.findByIdAndDelete({_id: userDetails.additionalDetails});
  
          await User.findByIdAndDelete({_id: id});
  
          return res.status(200).json({
              success: true,
              message: "User deleted successfully",
          });
      }
      catch(error){
          return res.status(500).json({
              success: false,
              error: error.message,
          });
      }
  }


exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.user.id;  // Assuming req.user.id contains the correct ObjectId string

        if (!id) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User details not found",
            });
        }

        return res.status(200).json({
            success: true,
            userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}


exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSections",
            },
          },
        })
        .exec()
      userDetails = userDetails.toObject()
      var SubsectionLength = 0
      for (var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
        for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[
            j
          ].subSections.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].courseContent[j].subSections.length
        }
        let courseProgressCount = await CourseProgress.findOne({
          courseID: userDetails.courses[i]._id,
          userId: userId,
        })
        courseProgressCount = courseProgressCount?.completedVideos.length
        if (SubsectionLength === 0) {
          userDetails.courses[i].progressPercentage = 100
        } else {
          // To make it up to 2 decimal point
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage =
            Math.round(
              (courseProgressCount / SubsectionLength) * 100 * multiplier
            ) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  
  exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }