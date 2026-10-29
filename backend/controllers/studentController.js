const Student = require("../models/Student");
const bcrypt = require("bcrypt");

// CREATE
// CREATE
const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json(student);

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const student = await Student.findOne({ email }).select("+password");

    if (!student || !(await student.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      message: "Login successful",
      student: student.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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
    console.log("GET STUDENTS HIT");

    const students = await Student.find();

    console.log("STUDENTS:", students);

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
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};