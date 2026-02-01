const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const internalAuth = require("./middleware/internalAuth.middleware");
const authRoutes = require("./routes/auth.route");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(internalAuth);

app.use("/", authRoutes);
// after routes
app.use(errorHandler);

module.exports = app;
