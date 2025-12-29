import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/User.js";

dotenv.config();

const firstNames = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Vihaan",
  "Arjun",
  "Sai",
  "Krishna",
  "Ishaan",
  "Rohan",
  "Ansh",
];

const plans = ["Basic", "Standard", "Premium"];
const statuses = ["active", "suspended"];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomIndianPhone(i) {
  // Create distinct E.164-like numbers for testing
  const base = 9000000000 + i * 137; // simple offset to avoid duplicates
  return "+91" + String(base);
}

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not set in environment");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const docs = Array.from({ length: 10 }).map((_, i) => {
    const name = randomChoice(firstNames) + " " + String(100 + i);
    const phone = randomIndianPhone(i + 1);
    const plan = randomChoice(plans);
    const status = randomChoice(statuses);

    return {
      name,
      phone,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      plan,
      expiryDate: daysFromNow(30 + i),
      balance: Math.floor(Math.random() * 1000),
      status,
    };
  });

  try {
    const result = await User.insertMany(docs, { ordered: false });
    console.log(`Inserted ${result.length} users`);
  } catch (err) {
    // Handle duplicate key errors gracefully during reseeds
    if (err?.writeErrors) {
      const inserted = 10 - err.writeErrors.length;
      console.warn(
        `Partial insert. Inserted ~${inserted}, duplicates skipped.`
      );
    } else {
      console.error("Insert failed:", err);
    }
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
