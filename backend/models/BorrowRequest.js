const mongoose = require("mongoose");

const borrowRequestSchema = new mongoose.Schema(
  {
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    requestDate: {
      type: Date,
      default: Date.now,
    },

    expectedReturnDate: {
      type: Date,
      required: true,
    },

    actualReturnDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Borrowed",
        "Returned",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "BorrowRequest",
  borrowRequestSchema
);