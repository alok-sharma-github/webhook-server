import crypto from "crypto";

export const verifyWebhook = (req, res, next) => {
  const signature =
    req.headers["x-signature"] || req.headers["x-webhook-signature"];
  if (!signature && process.env.NODE_ENV === "production") {
    return res.status(401).json({ error: "Missing signature" });
  }

  // Prefer raw body for signature verification to match provider signing
  const payload = req.rawBody
    ? req.rawBody
    : Buffer.from(JSON.stringify(req.body));
  const expected = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expected && process.env.NODE_ENV === "production") {
    return res.status(401).json({ error: "Invalid signature" });
  }

  next();
};
