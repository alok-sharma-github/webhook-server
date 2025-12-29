import mongoose from "mongoose";
import User from "../models/User.js";
import Lead from "../models/Lead.js";
import Ticket from "../models/Ticket.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Atlas connected");
    // Ensure indexes are created early to avoid first-hit latency
    await Promise.all([User.init(), Lead.init(), Ticket.init()]);
    console.log("MongoDB indexes ensured");
  } catch (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;
