const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { signupSchema, loginSchema } = require("../types/types");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../utilite/jwt");
const asyncHandler = require("../utilite/asyncHandler");

// REGISTER USER
exports.signup = asyncHandler(async (req, res) => {
  const createUser = signupSchema.safeParse(req.body);

  if (!createUser.success) {
    return res.status(400).json({
      message: "Invalid Input",
      error: createUser.error.errors,
    });
  }

  const { name, email, password } = createUser.data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const accessToken = generateAccessToken({
    userId: user._id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id,
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    message: "User created successfully",
  });
});

// LOGIN USER
exports.login = asyncHandler(async (req, res) => {
  const loginUser = loginSchema.safeParse(req.body);

  if (!loginUser.success) {
    return res.status(400).json({
      message: "Invalid Input",
      error: loginUser.error.errors,
    });
  }

  const { email, password } = loginUser.data;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const accessToken = generateAccessToken({
    userId: user._id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id,
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Login successful",
  });
});

// REFRESH TOKEN
exports.refreshTokenController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  const newAccessToken = generateAccessToken({
    userId: decoded.userId,
  });

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json({
    message: "Access token refreshed",
  });
});
