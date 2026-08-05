const express = require("express");
const router = express.Router();


const User = require("../models/User"); 

router.get("/", async (req, res) => {
  try {
    const tutors = await User.find({ role: "tutor", active: true })
      .select("firstName lastName email mobile subjects availability active")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(tutors);
  } catch (e) {
    console.error("Public tutors error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});
  
module.exports = router;