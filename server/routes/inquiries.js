const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry");
const auth = require("../middleware/auth");


router.post("/", auth, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const userId = req.user.id || req.user.userId || req.user._id;
    if (!userId) return res.status(401).json({ error: "Invalid token payload (no user id)." });

    const inquiry = await Inquiry.create({
      userId,
      name,
      email,
      subject,
      message,
    });

    return res.json({ message: "Inquiry sent successfully ✅", inquiry });
  } catch (err) {
    console.error("Inquiry create error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


router.get("/my", auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId || req.user._id;
    if (!userId) return res.status(401).json({ error: "Invalid token payload (no user id)." });

    const list = await Inquiry.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json(list);
  } catch (err) {
    console.error("Inquiry fetch error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
