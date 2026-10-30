const express = require("express");

const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.post("/", createItem);
router.get("/", getItems);
router.get("/:id", getItemById);
router.put("/:id", authenticateToken, authorizeRoles("supervisor", "admin"), updateItem);
router.delete("/:id", authenticateToken, authorizeRoles("supervisor", "admin"), deleteItem);

module.exports = router;