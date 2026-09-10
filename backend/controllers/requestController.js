const BorrowRequest = require("../models/BorrowRequest");
const Item = require("../models/Item");

// CREATE REQUEST
const createRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.create(req.body);

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL REQUESTS
const getRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find()
      .populate("borrower")
      .populate({
        path: "item",
        populate: {
          path: "owner",
        },
      });

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ACCEPT REQUEST
const acceptRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    request.status = "Accepted";
    await request.save();

    await Item.findByIdAndUpdate(
      request.item,
      {
        availabilityStatus: "Borrowed",
      }
    );

    res.json(request);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// REJECT REQUEST
const rejectRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    request.status = "Rejected";
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// RETURN ITEM
const returnItem = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    request.status = "Returned";
    request.actualReturnDate = new Date();

    await request.save();

    await Item.findByIdAndUpdate(
      request.item,
      {
        availabilityStatus: "Available",
      }
    );

    res.json(request);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
  returnItem,
};