const express = require("express");

const {
  createRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
  returnItem,
} = require("../controllers/requestController");

const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.post("/", createRequest);

router.get("/", getRequests);

router.put("/:id/accept", authenticateToken, authorizeRoles("supervisor", "admin"), acceptRequest);
router.put("/:id/reject", authenticateToken, authorizeRoles("supervisor", "admin"), rejectRequest);
router.put("/:id/return", authenticateToken, authorizeRoles("supervisor", "admin"), returnItem);

module.exports = router;