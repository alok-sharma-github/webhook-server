// src/models/Lead.js
import mongoose from "mongoose";
const leadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  interest: String,
  createdAt: { type: Date, default: Date.now },
});

// Index for repeated lead lookups by phone
leadSchema.index({ phone: 1 });
export default mongoose.model("Lead", leadSchema);
