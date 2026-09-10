const express = require("express");

const {
  createRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
  returnItem,
} = require("../controllers/requestController");

const router = express.Router();

router.post("/", createRequest);

router.get("/", getRequests);

router.put("/:id/accept", acceptRequest);

router.put("/:id/reject", rejectRequest);

router.put("/:id/return", returnItem);

module.exports = router;