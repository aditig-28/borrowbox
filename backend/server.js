const requestRoutes = require("./routes/requestRoutes");
const itemRoutes = require("./routes/itemRoutes");
const studentRoutes = require("./routes/studentRoutes");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Student = require("./models/Student");

dotenv.config();

connectDB().then(async () => {
  if (process.env.SUPERVISOR_EMAIL) {
    const supervisorEmails = process.env.SUPERVISOR_EMAIL.split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    await Student.updateMany(
      { email: { $in: supervisorEmails } },
      { $set: { role: "supervisor" } }
    );
  }
});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/students", studentRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "BorrowBox API is running",
  });
});

const PORT = process.env.PORT || 5053;

app.listen(PORT, () => {
  console.log(`BorrowBox server running on port ${PORT}`);
});