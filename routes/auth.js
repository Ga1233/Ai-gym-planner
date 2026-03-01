const express = require('express');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User    = require('../models/User');
const authMW  = require('../middleware/auth');

const router   = express.Router();
const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, fitnessLevel, goals, preferences } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ error: 'Email already registered' });

    const user  = await User.create({ name, email, password, fitnessLevel, goals, preferences });
    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) { next(err); }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user._id);
    user.password = undefined;
    res.json({ token, user });
  } catch (err) { next(err); }
});

// Get current user
router.get('/me', authMW, (req, res) => res.json({ user: req.user }));

module.exports = router;
