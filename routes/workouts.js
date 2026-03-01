const express = require('express');
const Workout = require('../models/Workout');
const authMW  = require('../middleware/auth');

const router = express.Router();
router.use(authMW);

router.get('/', async (req, res, next) => {
  try {
    const { category, limit = 50, page = 1 } = req.query;
    const filter = { user: req.user._id };
    if (category) filter.category = category;
    const workouts = await Workout.find(filter).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page)-1)*Number(limit));
    const total = await Workout.countDocuments(filter);
    res.json({ workouts, total });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const w = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!w) return res.status(404).json({ error: 'Workout not found' });
    res.json(w);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const w = await Workout.create({ ...req.body, user: req.user._id });
    res.status(201).json(w);
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['title','description','category','exercises','duration','scheduledFor','completedAt','rating','notes'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const w = await Workout.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, { new: true });
    if (!w) return res.status(404).json({ error: 'Workout not found' });
    res.json(w);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const w = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!w) return res.status(404).json({ error: 'Workout not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
