const express = require("express");

const {
  createStudent,
  loginStudent,
  setupMfa,
  enableMfa,
  getStudents,
  getStudentById,
  getCurrentStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { authenticateToken, authorizeRoles, requirePurpose } = require("../middleware/auth");

const router = express.Router();

router.post("/", createStudent);
router.post("/login", loginStudent);
router.post("/mfa/setup", authenticateToken, requirePurpose("mfa_setup"), setupMfa);
router.post("/mfa/enable", authenticateToken, requirePurpose("mfa_setup"), enableMfa);

router.get("/", authenticateToken, getStudents);

router.get("/me", authenticateToken, getCurrentStudent);

router.get("/:id", authenticateToken, getStudentById);

router.put("/:id", authenticateToken, authorizeRoles("supervisor", "admin"), updateStudent);
router.delete("/:id", authenticateToken, authorizeRoles("supervisor", "admin"), deleteStudent);

module.exports = router;