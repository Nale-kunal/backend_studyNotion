const mongoose = require("mongoose");

// Define the schema for the SubSection model
const subSectionSchema = new mongoose.Schema({
  title: { type: String },
	timeDuration: { type: String },
	description: { type: String },
	videoUrl: { type: String },
});

// Export the SubSection model
module.exports = mongoose.model("SubSection", subSectionSchema);
