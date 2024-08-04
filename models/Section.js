const mongoose = require("mongoose");

// Define the schema for the Section model
const sectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
  },
  subSections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SubSection",
    },
  ],
});

// Export the Section model
module.exports = mongoose.model("Section", sectionSchema);
