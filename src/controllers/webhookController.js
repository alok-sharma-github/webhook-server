import User from "../models/User.js";
import Lead from "../models/Lead.js";
import Ticket from "../models/Ticket.js";
import cache from "../utils/cache.js";

export const handleWebhook = async (req, res) => {
  // Gracefully handle missing nested objects
  const {
    tool_name,
    parameters = {},
    caller_phone,
    phone: topLevelPhone,
  } = req.body;

  // caller_phone is automatically sent by most platforms (Vapi, Retell, Bland)
  const phone = parameters.phone || caller_phone || topLevelPhone;

  try {
    switch (tool_name) {
      case "lookup_user": {
        if (!phone) return res.status(400).json({ error: "Phone required" });

        const cached = cache.get(phone);
        if (cached) {
          return res.json({
            found: true,
            data: cached,
            message: `Hello ${cached.name}! Your current plan is ${
              cached.plan
            }. It expires on ${cached.expiry || "N/A"}.`,
          });
        }

        const user = await User.findOne({ phone })
          .select("name plan expiryDate balance status")
          .lean()
          .exec();

        if (!user) {
          return res.json({
            found: false,
            message: "Sorry, I couldn't find an account with that number.",
          });
        }

        const clean = {
          name: user.name,
          plan: user.plan,
          expiry: user.expiryDate?.toLocaleDateString("en-IN"),
          status: user.status,
          balance: user.balance,
        };

        cache.set(phone, clean);

        return res.json({
          found: true,
          data: clean,
          message: `Hello ${clean.name}! Your current plan is ${
            clean.plan
          }. It expires on ${clean.expiry || "N/A"}.`,
        });
      }

      case "create_lead": {
        const lead = await Lead.create({
          name: parameters.name || "Anonymous",
          phone,
          email: parameters.email,
          interest: parameters.interest || "New DTH Subscription",
        });
        return res.json({
          success: true,
          message: `Thank you${
            parameters.name ? " " + parameters.name : ""
          }! We've recorded your interest. Our team will call you soon on ${phone}.`,
        });
      }

      case "raise_ticket": {
        const ticket = await Ticket.create({
          name: parameters.name || "Anonymous",
          phone,
          issue: parameters.issue,
        });
        return res.json({
          success: true,
          ticket_id: ticket._id,
          message: `Your support ticket has been created! We'll send a technician soon. Your reference ID is ${ticket._id
            .toString()
            .slice(-6)}.`,
        });
      }

      default:
        return res.status(400).json({ error: "Unknown tool" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
