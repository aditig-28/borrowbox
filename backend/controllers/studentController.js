const Student = require("../models/Student");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const createToken = (student, purpose = "access", expiresIn = "1h") =>
  jwt.sign(
    {
      id: student._id.toString(),
      role: student.role,
      purpose,
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );

// CREATE
// CREATE
const createStudent = async (req, res) => {
  try {
    const {
      role: _role,
      totpSecret: _totpSecret,
      totpEnabled: _totpEnabled,
      confirmPassword,
      ...safeDetails
    } = req.body;

    const requiredFields = ["studentId", "name", "phone", "email", "department", "year", "password"];
    const missingFields = requiredFields.filter((field) => !safeDetails[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (safeDetails.password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    if (confirmPassword !== undefined && confirmPassword !== safeDetails.password) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    safeDetails.email = safeDetails.email.trim().toLowerCase();
    const student = await Student.create(safeDetails);

    res.status(201).json({
      message: "Registration successful. Set up MFA to activate the account.",
      student: student.toJSON(),
      setupToken: createToken(student, "mfa_setup", "10m"),
      requiresMfaSetup: true,
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Student already exists",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

const loginStudent = async (req, res) => {
  try {
    const { email, password, totpCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const student = await Student.findOne({ email }).select("+password +totpSecret");

    if (!student || !(await student.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!student.totpEnabled) {
      return res.json({
        message: "TOTP enrollment required",
        requiresMfaSetup: true,
        setupToken: createToken(student, "mfa_setup", "10m"),
      });
    }

    if (!totpCode) {
      return res.status(400).json({
        message: "Authenticator code is required",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: student.totpSecret,
      encoding: "base32",
      token: totpCode,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({
        message: "Invalid authenticator code",
      });
    }

    res.json({
      message: "Login successful",
      student: student.toJSON(),
      token: createToken(student),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const setupMfa = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("+totpSecret");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.totpSecret || student.totpEnabled) {
      student.totpSecret = speakeasy.generateSecret({
        name: `BorrowBox (${student.email})`,
        issuer: "BorrowBox",
      }).base32;
      await student.save();
    }

    const otpauthUrl = speakeasy.otpauthURL({
      secret: student.totpSecret,
      encoding: "base32",
      label: student.email,
      issuer: "BorrowBox",
    });

    res.json({
      secret: student.totpSecret,
      otpauthUrl,
      qrCode: await QRCode.toDataURL(otpauthUrl),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const enableMfa = async (req, res) => {
  try {
    const { totpCode } = req.body;
    const student = await Student.findById(req.user.id).select("+totpSecret");
    if (!student || !student.totpSecret) {
      return res.status(400).json({ message: "Start MFA setup before enabling it" });
    }

    const verified = speakeasy.totp.verify({
      secret: student.totpSecret,
      encoding: "base32",
      token: totpCode,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ message: "Invalid authenticator code" });
    }

    student.totpEnabled = true;
    await student.save();

    res.json({
      message: "MFA enabled successfully",
      student: student.toJSON(),
      token: createToken(student),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL
// const getStudents = async (req, res) => {
//   try {
//     const students = await Student.find();
//     res.json(students);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };
const getStudents = async (req, res) => {
  try {
    const students = req.user.role === "student"
      ? await Student.find({ _id: req.user.id })
      : await Student.find();

    return res.json(students);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET ONE
const getStudentById = async (req, res) => {
  try {
    if (
      req.user.role === "student" &&
      req.params.id !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only access your own profile",
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCurrentStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    return res.json(student);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateCurrentStudent = async (req, res) => {
  try {
    const {
      role: _role,
      totpSecret: _totpSecret,
      totpEnabled: _totpEnabled,
      email: _email,
      studentId: _studentId,
      ...allowedUpdates
    } = req.body;

    if (allowedUpdates.password) {
      if (allowedUpdates.password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      allowedUpdates.password = await bcrypt.hash(allowedUpdates.password, 12);
    }

    const student = await Student.findByIdAndUpdate(req.user.id, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json(student);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE
const updateStudent = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    const student = await Student.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createStudent,
  loginStudent,
  setupMfa,
  enableMfa,
  getStudents,
  getStudentById,
  getCurrentStudent,
  updateCurrentStudent,
  updateStudent,
  deleteStudent,
};