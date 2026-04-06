import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/async-handler.js";
import { pool } from "../db/db.config.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const registerAdmin = asyncHandler(async (req, res) => {
  const { name, adminEmail, password, role } = req.body;

  const [existedUser] = await pool.query("SELECT * from users where email=?", [
    adminEmail,
  ]);

  if (existedUser.length !== 0) {
    //if user already exist in database
    return res.status(409).json({
      message: "User with email already exist",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (id,name, email, password,role_id, is_active) VALUES (?, ?, ?, ?, ?,?)",
    [uuidv4(), name, adminEmail, hashedPassword, 1, true],
  );

  res.status(201).json({
    message: "Admin registered successfully",
  });
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, userEmail, password, userRole } = req.body;

  const [existedUser] = await pool.query("SELECT * from users where email=?", [
    userEmail,
  ]);

  if (existedUser.length !== 0) {
    //if user already exist in database
    return res.status(409).json({
      message: "User with email already exist",
    });
  }

  const [result] = await pool.query("SELECT * FROM access_roles WHERE role=?", [
    userRole.toUpperCase(),
  ]);

  if (result.length == 0) {
    return res.status(404).json({
      message: "Role not found",
    });
  }
  const assignedRole = result[0].id;
  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (id,name, email, password, role_id, is_active) VALUES (?, ?, ?, ?, ?,?)",
    [uuidv4(), name, userEmail, hashedPassword, assignedRole, true],
  );

  res.status(201).json({
    message: "User registered successfully",
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [users] = await pool.query("SELECT * FROM users WHERE email=(?)", [
    email,
  ]);
  if (users.length === 0) {
    return res.status(401).json({ message: "User not found" });
  }
  const user = users[0];

  if (!user.is_active) {
    return res.status(403).json({ message: "User is inactive" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res
      .status(401)
      .json({ message: "Invalid Credentials", accessToken: null });
  }

  const [result] = await pool.query("SELECT * FROM access_roles WHERE id=?", [
    user.role_id,
  ]);

  if (result.length == 0) {
    return res.status(404).json({
      message: "Role not found",
    });
  }
  const assignedRole = result[0].role;

  const accessToken = jwt.sign(
    {
      id: user.id,
      role: assignedRole,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  const options = {
    httpOnly: true,
    secure: false,
  };

  await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [
    refreshToken,
    user.id,
  ]);

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
    })
    .json({
      message: "Login successful",
      id: user.id,
      email: user.email,
      name: user.name,
      role: assignedRole,
      is_active: user.is_active,
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [
    decoded.id,
  ]);

  if (users.length === 0) {
    return res.status(401).json({ message: "User not found" });
  }

  const user = users[0];

  if (user.refresh_token !== token) {
    return res.status(401).json({ message: "Token mismatch" });
  }

  // Generate new access token
  const newAccessToken = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  res
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
    })
    .json({ message: "Token refreshed" });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    await pool.query("UPDATE users SET refresh_token = NULL WHERE id = ?", [
      decoded.id,
    ]);
  }

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logged out" });
});

const updateUserActiveStatus = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    return res.status(400).json({
      message: "is_active must be true or false",
    });
  }

  //  Check if user exists
  const [users] = await pool.query(
    "SELECT id, is_active FROM users WHERE id = ?",
    [userId],
  );

  if (users.length === 0) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  //  Prevent admin disabling themselves
  if (req.user.id === userId) {
    return res.status(400).json({
      message: "Admin cannot change their own status",
    });
  }
  if (!is_active) {
    await pool.query("UPDATE users SET refresh_token = NULL WHERE id = ?", [
      userId,
    ]);
  }
  // Update status
  await pool.query("UPDATE users SET is_active = ? WHERE id = ?", [
    is_active,
    userId,
  ]);

  // Response
  res.json({
    message: `User has been ${
      is_active ? "activated" : "deactivated"
    } successfully`,
    user_id: userId,
    is_active,
  });
});

export {
  registerUser,
  login,
  refreshAccessToken,
  logout,
  registerAdmin,
  updateUserActiveStatus,
};
