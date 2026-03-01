const express = require('express');
const User    = require('../models/User');
const authMW  = require('../middleware/auth');

const router = express.Router();
router.use(authMW);

router.patch('/profile', async (req, res, next) => {
  try {
    const allowed = ['name', 'fitnessLevel', 'goals', 'preferences'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) { next(err); }
});

router.patch('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
    if (newPassword.length < 8)
      return res.status(400).json({ error: 'New password must be at least 8 characters' });

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
});

router.delete('/account', async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
