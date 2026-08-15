import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate admin user and issue JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const admin = await Admin.findOne({ username: cleanUsername });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const secret = process.env.JWT_SECRET || 'nitw_campus_navigator_super_secret_jwt_key_2025';
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Check if existing stored token is still valid
 * @access  Protected
 */
router.get('/verify', verifyToken, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user,
  });
});

export default router;
