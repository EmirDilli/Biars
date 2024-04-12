const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRouter = require("./src/routes/auth");

dotenv.config();
const app = express();
const PORT = 3000;

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "Server acitvated",
  });
});
app.use("/api/v1/auth", authRouter);

async function run() {
  mongoose
    .connect(process.env.CONNECTIONSTRING)
    .then(() => console.log("Database connected!"))
    .catch((err) => console.log(err));
  app.listen(PORT, () => console.log("Server is Activated"));
}

run();
