import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: String,
  plan: { type: String, default: "Basic" },
  expiryDate: Date,
  balance: Number,
  status: { type: String, enum: ["active", "suspended"], default: "active" },
});

export default mongoose.model("User", userSchema);
