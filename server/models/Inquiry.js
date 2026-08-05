  const mongoose = require("mongoose");

  const inquirySchema = new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      subject: { type: String, required: true, trim: true },
      message: { type: String, required: true, trim: true },
      status: { type: String, default: "open", enum: ["open", "closed"] },
    },
    { timestamps: true }
  );

  module.exports = mongoose.model("Inquiry", inquirySchema);
