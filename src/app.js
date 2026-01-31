const express = require("express");
const authRoutes = require("../routes/auth.route");
const todoRoutes = require("../routes/todo.routes");
const {
  authLimiter,
  todoLimiter,
} = require("../middleware/rateLimit.middleware");

const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authLimiter, authRoutes);
app.use("/todos", todoLimiter, todoRoutes);

module.exports = app;
