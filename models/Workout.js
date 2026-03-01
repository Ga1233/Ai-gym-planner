const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  sets:      { type: Number, default: 3 },
  reps:      { type: String, default: '10' },
  rest:      { type: Number, default: 60 },
  weight:    { type: String, default: '' },
  notes:     { type: String, default: '' },
  completed: { type: Boolean, default: false },
}, { _id: false });

const workoutSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:         { type: String, required: true, trim: true },
  description:   { type: String, default: '' },
  category:      { type: String, enum: ['strength','cardio','hiit','flexibility','endurance','sports','custom'], default: 'custom' },
  exercises:     [exerciseSchema],
  duration:      { type: Number, default: 0 },
  isAiGenerated: { type: Boolean, default: false },
  scheduledFor:  { type: Date },
  completedAt:   { type: Date },
  rating:        { type: Number, min: 1, max: 5 },
  notes:         { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
