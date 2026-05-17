const { validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');

const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const adminExists = await User.adminExists();
    if (adminExists && role === 'admin') {
      return res.status(409).json({
        success: false,
        message: 'Only one global admin account is allowed. Please sign up as a member.',
      });
    }

    const assignedRole = adminExists ? 'member' : 'admin';
    const user = await User.create({ name, email, password, role: assignedRole });
    const token = signToken(user._id);
    const message = assignedRole === 'admin'
      ? 'Workspace admin account created successfully.'
      : 'Member account created successfully.';
    res.status(201).json({ success: true, message, token, user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOneWithPassword({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = signToken(user._id);
    res.json({ success: true, message: 'Logged in successfully.', token, user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name } = req.body;
    const user = await User.updateById(req.user._id, { name });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const getSetupStatus = async (req, res, next) => {
  try {
    const adminExists = await User.adminExists();
    res.json({ success: true, adminExists });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, getAllUsers, updateProfile, getSetupStatus };
