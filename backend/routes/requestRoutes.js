const express = require("express");
const BorrowRequest = require("../models/BorrowRequest");

const {
  createRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
  returnItem,
} = require("../controllers/requestController");

const router = express.Router();
const { authenticateToken } = require("../middleware/auth");

// Authorize request decisions: item owners, supervisors, and admins can decide
const authorizeRequestDecision = async (req, res, next) => {
  if (req.user.purpose && req.user.purpose !== "access") {
    return res.status(403).json({ message: "Insufficient role permissions" });
  }

  if (req.user.role === "supervisor" || req.user.role === "admin") {
    return next();
  }

  try {
    const borrowReq = await BorrowRequest.findById(req.params.id).populate("item");
    if (!borrowReq) {
      return res.status(404).json({ message: "Request not found" });
    }

    const itemOwnerId = borrowReq.item?.owner?.toString();
    if (itemOwnerId && itemOwnerId === req.user.id) {
      return next();
    }
  } catch (_err) {
    // fall through to 403
  }

  return res.status(403).json({
    message: "Insufficient role permissions",
  });
};

router.post("/", createRequest);

router.get("/", getRequests);

router.put("/:id/accept", authenticateToken, authorizeRequestDecision, acceptRequest);
router.put("/:id/reject", authenticateToken, authorizeRequestDecision, rejectRequest);
router.put("/:id/return", authenticateToken, authorizeRequestDecision, returnItem);

module.exports = router;
