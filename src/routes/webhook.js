import express from "express";
import { handleWebhook } from "../controllers/webhookController.js";
import { verifyWebhook } from "../middleware/verifyWebhook.js";

const router = express.Router();

router.post("/", verifyWebhook, handleWebhook);

export default router;
