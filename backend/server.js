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
    await Student.updateOne(
      { email: process.env.SUPERVISOR_EMAIL },
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`BorrowBox server running on port ${PORT}`);
});