// Import the Cloudinary library
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload an image to Cloudinary
// Parameters:
// - file: the file to be uploaded
// - folder: the folder in Cloudinary where the file should be stored
exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    // Options for the upload, including the folder and automatic resource type detection
    const options = {folder};
    if(height){
        options.height = height;
    }
    if(quality){
        options.quality = quality;
    }

    options.resource_type = "auto";

    // Upload the file to Cloudinary with the specified options
    return await cloudinary.uploader.upload(file.tempFilePath, options);
};

// Function to delete an image from Cloudinary
// Parameters:
// - publicId: the public ID of the image to be deleted
exports.deleteImageFromCloudinary = async (publicId) => {
    // Delete the image from Cloudinary using the public ID
    const result = await cloudinary.uploader.destroy(publicId);
    // Return the result of the deletion
    return result;
};
