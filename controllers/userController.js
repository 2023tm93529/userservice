const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET || "B7dx9M#p2s%Lq8j5ZGc!K3vF6tY4wRnE";

// Helper function to remove password from user object
const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  const { password, ...userWithoutPassword } = userObject;
  return userWithoutPassword;
};

// Register logic
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;  // Role will be passed from the client

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    // Ensure role is either 'admin' or 'user'
    if (role && role !== 'admin' && role !== 'user') {
      return res.status(400).json({ message: 'Invalid role. Role must be either "admin" or "user".' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with role passed from the request
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',  // Default to 'user' if no role is provided
    });

    res.status(201).json({
      message: 'User created successfully',
      user: sanitizeUser(user)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login logic
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
        { id: user._id, role: user.role }, // Store user ID and role in the token
        secretKey,
        { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user information
exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(userId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get current user information (from token)
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};