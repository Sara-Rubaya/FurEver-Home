
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// JWT token generate
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate fields
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role === "shelter" ? "shelter" : "adopter",
    });

    // Generate JWT
    const token = generateToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    // MongoDB duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// @route PATCH /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { phone, address, location } = req.body;

    const update = {};

    if (typeof phone === "string") {
      update.phone = phone.trim();
    }

    if (typeof address === "string") {
      update.address = address.trim();
    }

    if (
      typeof location?.lat === "number" &&
      typeof location?.lng === "number"
    ) {
      update.location = {
        lat: location.lat,
        lng: location.lng,
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      update,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      message: "Profile update failed",
      error: error.message,
    });
  }
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
};
