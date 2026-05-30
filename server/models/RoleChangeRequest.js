const mongoose = require('mongoose');

const roleChangeRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentRole: { type: String, required: true },
  requestedRole: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('RoleChangeRequest', roleChangeRequestSchema);