// src/models/Ticket.js
import mongoose from "mongoose";
const ticketSchema = new mongoose.Schema({
  name: String,
  phone: String,
  issue: String,
  status: { type: String, default: "open" },
  createdAt: { type: Date, default: Date.now },
});

// Index to speed up ticket queries by phone
ticketSchema.index({ phone: 1 });
export default mongoose.model("Ticket", ticketSchema);
