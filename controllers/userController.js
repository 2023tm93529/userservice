const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET;

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

    res.status(201).json({ message: 'User created successfully', user });
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

    // res.json({ token });
    res.status(200).json({ message: 'Login successful', user,token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
