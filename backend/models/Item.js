const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Books",
        "Electronics",
        "Academic",
        "Lab Equipment",
        "Sports",
        "Accessories",
        "Other",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    condition: {
      type: String,
      required: true,
    },

    location: {
      type: String,
    },

    availabilityStatus: {
      type: String,
      enum: [
        "Available",
        "Requested",
        "Borrowed",
        "Unavailable",
      ],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);