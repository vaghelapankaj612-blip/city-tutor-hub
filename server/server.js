// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Inquiries Routes (separate file)
const inquiriesRoute = require("./routes/inquiries");
app.use("/api/inquiries", inquiriesRoute);

// ✅ Admin auth middleware
const adminAuth = require("./middleware/adminAuth");

// ✅ Inquiry model (IMPORTANT)
const Inquiry = require("./models/Inquiry");

// ✅ Mongo
mongoose
  .connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/tutorDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

/* =========================
   SCHEMAS / MODELS
========================= */

// ✅ Booking Schema
const bookingSchema = new mongoose.Schema({
  subject: String,

  // ✅ we will store tutor NAME string here (NOT tutorId)
  tutor: String,

  name: String,
  email: String,
  date: String,
  startTime: String,
  endTime: String,

  cancelToken: String,
  rescheduleToken: String,

  status: { type: String, default: "booked" },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema, "tutorbooking");

// ✅ User Schema (ONLY normal users)
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ["male", "female", "other"] },
    mobile: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    passwordHash: { type: String, required: true },

    // ✅ Forgot/Reset fields
    resetPasswordTokenHash: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");

// ✅ Tutor Schema (SEPARATE COLLECTION: tutors)
const tutorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ["male", "female", "other"] },
    mobile: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    age: { type: Number, required: true, min: 1, max: 120 },

    subjects: { type: [String], default: [] },
    availability: {
      startHour: { type: Number, default: 10 },
      endHour: { type: Number, default: 18 },
      slotDuration: { type: Number, default: 2 },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Tutor = mongoose.model("Tutor", tutorSchema, "tutors");

/* =========================
   AUTH HELPERS
========================= */

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing in .env");
  return jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: "7d" });
}

function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No token." });

    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token." });
  }
}

/* =========================
   MAIL (NODEMAILER)
========================= */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function formatTime12Hour(time) {
  if (!time) return "";
  const [hStr, mStr] = String(time).split(":");
  let hour = Number(hStr);
  const minute = mStr || "00";
  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${ampm}`;
}

// ✅ NEW: live booking status helper
function getBookingLiveStatus(booking) {
  if (!booking) return "booked";

  const currentStatus = String(booking.status || "booked").toLowerCase();

  // cancelled manually hoy to એ જ રહે
  if (currentStatus === "cancelled") return "cancelled";

  const now = new Date();
  const bookingStart = new Date(`${booking.date}T${booking.startTime}:00`);
  const bookingEnd = new Date(`${booking.date}T${booking.endTime}:00`);

  if (now < bookingStart) return "booked";
  if (now >= bookingStart && now < bookingEnd) return "started";
  return "completed";
}

async function syncBookingStatus(bookingDoc) {
  if (!bookingDoc) return bookingDoc;

  const liveStatus = getBookingLiveStatus(bookingDoc);

  if (String(bookingDoc.status || "").toLowerCase() !== liveStatus) {
    bookingDoc.status = liveStatus;
    await bookingDoc.save();
  }

  return bookingDoc;
}

async function syncAllBookingStatuses() {
  try {
    const bookings = await Booking.find({
      status: { $ne: "cancelled" },
    });

    for (const booking of bookings) {
      const liveStatus = getBookingLiveStatus(booking);
      if (String(booking.status || "").toLowerCase() !== liveStatus) {
        booking.status = liveStatus;
        await booking.save();
      }
    }
  } catch (err) {
    console.error("Status sync error:", err);
  }
}

function buildBookingEmail({
  name,
  subject,
  tutor,
  date,
  startTime,
  endTime,
  cancelLink,
  rescheduleLink,
}) {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
      <div style="background-color: #0d6efd; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">City Tutor Hub</h1>
        <p style="margin: 5px 0 0;">Demo Class Booking Confirmation</p>
      </div>
      <div style="padding: 25px; color: #333;">
        <h2 style="margin-top: 0;">Hello ${name}, 👋</h2>
        <p>Your demo class has been successfully scheduled. Here are your session details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Subject</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Tutor</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${tutor}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Time</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}</td>
          </tr>
        </table>
        <div style="text-align:center; margin: 30px 0;">
          <a href="${cancelLink}"
            style="background-color:#dc3545; color:white; padding:12px 20px; text-decoration:none; border-radius:5px; display:inline-block; margin:5px;">
            ❌ Cancel Class
          </a>
          <a href="${rescheduleLink}"
            style="background-color:#ffc107; color:black; padding:12px 20px; text-decoration:none; border-radius:5px; display:inline-block; margin:5px;">
            🔁 Reschedule Class
          </a>
        </div>
        <p style="margin-top: 30px;">Best regards,<br><strong>City Tutor Hub Team</strong></p>
      </div>
      <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777;">
        © 2026 City Tutor Hub. All rights reserved.
      </div>
    </div>
  </div>`;
}

async function sendBookingEmail({
  to,
  name,
  subject,
  tutor,
  date,
  startTime,
  endTime,
  cancelToken,
  rescheduleToken,
}) {
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
  const cancelLink = `${BACKEND_URL}/api/cancel/${cancelToken}`;
  const rescheduleLink = `${BACKEND_URL}/api/reschedule/${rescheduleToken}`;

  const html = buildBookingEmail({
    name,
    subject,
    tutor,
    date,
    startTime,
    endTime,
    cancelLink,
    rescheduleLink,
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject: "City Tutor Hub - Demo Booking Confirmation",
    html,
  });
}

// Forgot Password / Reset Password full code

async function sendResetPasswordEmail({ to, firstName, resetLink }) {
  const html = `
    <div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08);">
        <div style="background:#0d6efd; color:#fff; padding:20px; text-align:center;">
          <h1 style="margin:0;">City Tutor Hub</h1>
          <p style="margin:5px 0 0;">Password Reset Request</p>
        </div>

        <div style="padding:25px; color:#333;">
          <h2 style="margin-top:0;">Hello ${firstName || "User"}, 👋</h2>
          <p>We received a request to reset your password.</p>
          <p>Click the button below to set a new password:</p>

          <div style="text-align:center; margin:30px 0;">
            <a href="${resetLink}"
               style="background:#0d6efd; color:#fff; padding:12px 22px; text-decoration:none; border-radius:6px; display:inline-block;">
              Reset Password
            </a>
          </div>

          <p>This link will expire in <strong>15 minutes</strong>.</p>
          <p>If you did not request this, you can safely ignore this email.</p>

          <p style="margin-top:30px;">Best regards,<br><strong>City Tutor Hub Team</strong></p>
        </div>

        <div style="background:#f1f1f1; text-align:center; padding:15px; font-size:12px; color:#777;">
          © 2026 City Tutor Hub. All rights reserved.
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject: "City Tutor Hub - Reset Your Password",
    html,
  });
}

/* =========================
   AUTH ROUTES (USER)
========================= */

// ✅ REGISTER (User only)
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, gender, mobile, email, age, password, confirmPassword } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !gender ||
      !mobile ||
      !email ||
      !age ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) return res.status(400).json({ error: "Email already registered." });

    const existingMobile = await User.findOne({ mobile: String(mobile) });
    if (existingMobile) return res.status(400).json({ error: "Mobile already registered." });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      gender,
      mobile: String(mobile),
      email: email.toLowerCase(),
      age: Number(age),
      passwordHash,
    });

    const token = signToken(user);

    return res.status(201).json({
      message: "Registered successfully!",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// ✅ LOGIN (User: email OR mobile)
app.post("/api/login", async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({ error: "Email/Mobile and password are required." });
    }

    const query = String(emailOrMobile).includes("@")
      ? { email: String(emailOrMobile).toLowerCase() }
      : { mobile: String(emailOrMobile) };

    const user = await User.findOne(query);
    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials." });

    const token = signToken(user);

    return res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// ✅ ME (Protected)
app.get("/api/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json(user);
  } catch {
    return res.status(500).json({ error: "Server error." });
  }
});

/* =========================
   FORGOT / RESET PASSWORD
========================= */

// ✅ Forgot Password (email OR mobile)
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { emailOrMobile } = req.body || {};

    if (!emailOrMobile) {
      return res.status(400).json({ error: "Email or mobile is required." });
    }

    const input = String(emailOrMobile).trim();

    const query = input.includes("@")
      ? { email: input.toLowerCase() }
      : { mobile: input };

    const user = await User.findOne(query);

    if (!user) {
      return res.json({
        message: "If account exists, reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${FRONTEND_URL}/reset-password/${rawToken}`;

    try {
      await sendResetPasswordEmail({
        to: user.email,
        firstName: user.firstName,
        resetLink,
      });
    } catch (mailErr) {
      console.error("Forgot password email error:", mailErr);

      user.resetPasswordTokenHash = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(500).json({ error: "Failed to send reset email." });
    }

    return res.json({
      message: "If account exists, reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// ✅ Reset Password
app.post("/api/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body || {};

    if (!password || !confirmPassword) {
      return res.status(400).json({ error: "Password and confirm password are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    user.passwordHash = passwordHash;
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

/* =========================
   BOOKING ROUTES
========================= */

// ✅ Query bookings: /api/bookings?tutor=NAME&date=YYYY-MM-DD
app.get("/api/bookings", async (req, res) => {
  try {
    const { tutor, date } = req.query;

    if (!tutor || !date) {
      return res.status(400).json({ error: "tutor and date required" });
    }

    await syncAllBookingStatuses();

    const bookings = await Booking.find({
      tutor: String(tutor),
      date: String(date),
      status: { $in: ["booked", "started"] },
    });

    return res.json(bookings);
  } catch (err) {
    console.error("Bookings fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// ✅ Backward compatible (old style) /api/bookings/:tutor/:date
app.get("/api/bookings/:tutor/:date", async (req, res) => {
  try {
    const tutor = decodeURIComponent(req.params.tutor);
    const date = decodeURIComponent(req.params.date);

    await syncAllBookingStatuses();

    const bookings = await Booking.find({
      tutor,
      date,
      status: { $in: ["booked", "started"] },
    });

    return res.json(bookings);
  } catch (e) {
    console.error("Old bookings route error:", e);
    return res.status(500).json({ error: "Error fetching bookings" });
  }
});

// ✅ User bookings by email (needed by frontend)
app.get("/api/user-bookings/:email", async (req, res) => {
  try {
    const email = String(req.params.email || "").toLowerCase();

    await syncAllBookingStatuses();

    const bookings = await Booking.find({
      email,
    }).sort({ _id: -1 });

    return res.json(bookings);
  } catch (err) {
    console.error("User bookings error:", err);
    return res.status(500).json({ error: "Error fetching user bookings" });
  }
});

// ✅ BOOK DEMO
app.post("/api/book-demo", async (req, res) => {
  try {
    const { tutor, date, startTime, endTime, email, name, subject } = req.body;

    if (!tutor || !date || !startTime || !endTime || !email || !name || !subject) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (String(date) < todayStr) {
      return res.status(400).json({ error: "Past date booking is not allowed." });
    }

    const bookingStart = new Date(`${date}T${startTime}:00`);
    if (bookingStart < new Date()) {
      return res.status(400).json({ error: "Past time slot booking is not allowed." });
    }

    const cancelToken = crypto.randomBytes(16).toString("hex");
    const rescheduleToken = crypto.randomBytes(16).toString("hex");

    const newBooking = new Booking({
      tutor: String(tutor),
      date: String(date),
      startTime: String(startTime),
      endTime: String(endTime),
      email: String(email).toLowerCase(),
      name: String(name),
      subject: String(subject),
      cancelToken,
      rescheduleToken,
      status: "booked",
    });

    await newBooking.save();

    try {
      await sendBookingEmail({
        to: email,
        name,
        subject,
        tutor,
        date,
        startTime,
        endTime,
        cancelToken,
        rescheduleToken,
      });
    } catch (mailErr) {
      console.error("❌ Email send failed:", mailErr);
    }

    return res.status(201).json({ success: true, message: "Booking saved successfully!" });
  } catch (error) {
    console.error("Book-demo Error:", error);
    return res.status(500).json({ error: "Failed to save booking" });
  }
});

// ✅ AUTO STATUS SYNC
cron.schedule("* * * * *", async () => {
  await syncAllBookingStatuses();
});

/* =========================
   ✅ PUBLIC TUTORS API
========================= */

app.get("/api/tutors", async (req, res) => {
  try {
    const tutors = await Tutor.find({ active: true })
      .select("firstName lastName subjects availability active")
      .sort({ _id: -1 })
      .lean();

    return res.json(tutors);
  } catch (e) {
    console.error("Public tutors error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

// ✅ USER: My bookings (for Profile page)
app.get("/api/bookings/my", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await syncAllBookingStatuses();

    const bookings = await Booking.find({
      email: String(user.email).toLowerCase(),
    }).sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (err) {
    console.error("My bookings error:", err);
    return res.status(500).json({ error: "Failed to fetch your bookings." });
  }
});

// ✅ USER: Update my booking (for Profile page)
app.put("/api/bookings/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    if (String(booking.email).toLowerCase() !== String(user.email).toLowerCase()) {
      return res.status(403).json({ error: "You can only edit your own booking." });
    }

    const { subject, tutor, date, startTime, endTime } = req.body || {};

    if (!subject || !tutor || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (String(date) < todayStr) {
      return res.status(400).json({ error: "Past date is not allowed." });
    }

    const bookingStart = new Date(`${date}T${startTime}:00`);
    if (bookingStart < new Date()) {
      return res.status(400).json({ error: "Past time slot is not allowed." });
    }

    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      tutor: String(tutor),
      date: String(date),
      status: { $in: ["booked", "started"] },
      startTime: { $lt: String(endTime) },
      endTime: { $gt: String(startTime) },
    });

    if (conflict) {
      return res.status(409).json({ error: "Selected slot is already booked." });
    }

    booking.subject = String(subject);
    booking.tutor = String(tutor);
    booking.date = String(date);
    booking.startTime = String(startTime);
    booking.endTime = String(endTime);

    await booking.save();
    await syncBookingStatus(booking);

    return res.json({
      message: "Booking updated successfully.",
      booking,
    });
  } catch (err) {
    console.error("Update my booking error:", err);
    return res.status(500).json({ error: "Failed to update booking." });
  }
});

// ✅ USER: Delete my booking (for Profile page)
app.delete("/api/bookings/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    if (String(booking.email).toLowerCase() !== String(user.email).toLowerCase()) {
      return res.status(403).json({ error: "You can only delete your own booking." });
    }

    await Booking.findByIdAndDelete(req.params.id);

    return res.json({ message: "Booking deleted successfully." });
  } catch (err) {
    console.error("Delete my booking error:", err);
    return res.status(500).json({ error: "Failed to delete booking." });
  }
});

/* =========================
   ✅ ADMIN ROUTES
========================= */

// ✅ Admin login (ENV based)
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign({ isAdmin: true, email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ token, admin: { email } });
  } catch (e) {
    console.error("Admin login error:", e);
    return res.status(500).json({ message: "Admin login error" });
  }
});

// ✅ Admin stats
app.get("/api/admin/stats", adminAuth, async (req, res) => {
  try {
    await syncAllBookingStatuses();

    const users = await User.countDocuments();
    const tutors = await Tutor.countDocuments();
    const appointments = await Booking.countDocuments();
    const inquiries = await Inquiry.countDocuments();

    return res.json({ users, tutors, appointments, inquiries });
  } catch (e) {
    console.error("Stats error:", e);
    return res.status(500).json({ message: "Stats error" });
  }
});
// app.get("/api/admin/stats", adminAuth, async (req, res) => {
//   try {
//     await syncAllBookingStatuses();

//     const users = await User.countDocuments();
//     const tutors = await Tutor.countDocuments();
//     const bookings = await Booking.countDocuments();
//     const inquiries = await Inquiry.countDocuments();

//     return res.json({ users, tutors, bookings, inquiries });
//   } catch (e) {
//     console.error("Stats error:", e);
//     return res.status(500).json({ message: "Stats error" });
//   }
// });

// ✅ Admin users
app.get("/api/admin/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ _id: -1 });
    return res.json(users);
  } catch (e) {
    console.error("Admin users error:", e);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ✅ Admin tutors
app.get("/api/admin/tutors", adminAuth, async (req, res) => {
  try {
    const tutors = await Tutor.find().select("-passwordHash").sort({ _id: -1 });
    return res.json(tutors);
  } catch (e) {
    console.error("Admin tutors error:", e);
    return res.status(500).json({ message: "Failed to fetch tutors" });
  }
});

// ✅ Admin bookings list
app.get("/api/admin/bookings", adminAuth, async (req, res) => {
  try {
    await syncAllBookingStatuses();
    const bookings = await Booking.find().sort({ _id: -1 });
    return res.json(bookings);
  } catch (e) {
    console.error("Admin bookings error:", e);
    return res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// ✅ Optional alias: appointments list
app.get("/api/admin/appointments", adminAuth, async (req, res) => {
  try {
    await syncAllBookingStatuses();
    const bookings = await Booking.find().sort({ _id: -1 });
    return res.json(bookings);
  } catch (e) {
    console.error("Admin appointments error:", e);
    return res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

// ✅ Admin inquiries
app.get("/api/admin/inquiries", adminAuth, async (req, res) => {
  try {
    const list = await Inquiry.find().sort({ _id: -1 });
    return res.json(list);
  } catch (e) {
    console.error("Admin inquiries error:", e);
    return res.status(500).json({ message: "Failed to fetch inquiries" });
  }
});

// ✅ Admin: Create Tutor
app.post("/api/admin/tutors", adminAuth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      mobile,
      email,
      age,
      subjects,
      availability,
      active,
    } = req.body || {};

    if (!firstName || !lastName || !gender || !mobile || !email || !age) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmail = await Tutor.findOne({ email: String(email).toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingMobile = await Tutor.findOne({ mobile: String(mobile) });
    if (existingMobile) {
      return res.status(400).json({ message: "Mobile already registered" });
    }

    const subjectsArr = Array.isArray(subjects)
      ? subjects
      : String(subjects || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const tutor = await Tutor.create({
      firstName,
      lastName,
      gender,
      mobile: String(mobile),
      email: String(email).toLowerCase(),
      age: Number(age),
      subjects: subjectsArr,
      availability: {
        startHour: Number(availability?.startHour ?? 10),
        endHour: Number(availability?.endHour ?? 18),
        slotDuration: Number(availability?.slotDuration ?? 2),
      },
      active: active !== undefined ? !!active : true,
    });

    return res.status(201).json({
      message: "Tutor created",
      tutor: { ...tutor.toObject() },
    });
  } catch (e) {
    console.error("Create tutor error:", e);
    return res.status(500).json({ message: "Failed to create tutor" });
  }
});

// ✅ Admin: Update Tutor
app.put("/api/admin/tutors/:id", adminAuth, async (req, res) => {
  try {
    const t = await Tutor.findById(req.params.id);
    if (!t) return res.status(404).json({ message: "Tutor not found" });

    const {
      firstName,
      lastName,
      gender,
      mobile,
      email,
      age,
      subjects,
      availability,
      active,
    } = req.body || {};

    if (firstName != null) t.firstName = firstName;
    if (lastName != null) t.lastName = lastName;
    if (gender != null) t.gender = gender;
    if (mobile != null) t.mobile = String(mobile);
    if (email != null) t.email = String(email).toLowerCase();
    if (age != null) t.age = Number(age);

    if (subjects != null) {
      t.subjects = Array.isArray(subjects)
        ? subjects
        : String(subjects || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    if (availability != null) {
      t.availability = {
        startHour: Number(availability?.startHour ?? t.availability?.startHour ?? 10),
        endHour: Number(availability?.endHour ?? t.availability?.endHour ?? 18),
        slotDuration: Number(availability?.slotDuration ?? t.availability?.slotDuration ?? 2),
      };
    }

    if (active != null) t.active = !!active;

    await t.save();

    return res.json({
      message: "Tutor updated",
      tutor: { ...t.toObject(), passwordHash: undefined },
    });
  } catch (e) {
    console.error("Update tutor error:", e);
    return res.status(500).json({ message: "Failed to update tutor" });
  }
});

// ✅ Admin: Delete Tutor
app.delete("/api/admin/tutors/:id", adminAuth, async (req, res) => {
  try {
    const t = await Tutor.findById(req.params.id);
    if (!t) return res.status(404).json({ message: "Tutor not found" });

    await Tutor.findByIdAndDelete(req.params.id);
    return res.json({ message: "Tutor deleted" });
  } catch (e) {
    console.error("Delete tutor error:", e);
    return res.status(500).json({ message: "Failed to delete tutor" });
  }
});

// ✅ Admin: Update booking
app.put("/api/admin/bookings/:id", adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const { subject, tutor, name, email, date, startTime, endTime, status } = req.body || {};

    if (subject != null) booking.subject = subject;
    if (tutor != null) booking.tutor = tutor;
    if (name != null) booking.name = name;
    if (email != null) booking.email = String(email).toLowerCase();
    if (date != null) booking.date = date;
    if (startTime != null) booking.startTime = startTime;
    if (endTime != null) booking.endTime = endTime;

    if (status != null) {
      booking.status = status;
    }

    await booking.save();

    if (status == null || String(status).toLowerCase() !== "cancelled") {
      await syncBookingStatus(booking);
    }

    return res.json({
      message: "Booking updated",
      booking,
    });
  } catch (e) {
    console.error("Update booking error:", e);
    return res.status(500).json({ message: "Failed to update booking" });
  }
});

// ✅ Admin: Delete booking
app.delete("/api/admin/bookings/:id", adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await Booking.findByIdAndDelete(req.params.id);
    return res.json({ message: "Booking deleted" });
  } catch (e) {
    console.error("Delete booking error:", e);
    return res.status(500).json({ message: "Failed to delete booking" });
  }
});

// ✅ Optional old appointment complete route
app.put("/api/admin/appointments/:id/complete", adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Appointment not found" });

    if (booking.status === "cancelled") {
      return res.status(409).json({ message: "Cancelled appointment cannot be completed" });
    }

    booking.status = "completed";
    await booking.save();

    return res.json({ message: "Appointment marked as completed" });
  } catch (e) {
    console.error("Complete appointment error:", e);
    return res.status(500).json({ message: "Failed to complete appointment" });
  }
});

// ✅ Optional old appointment cancel route
app.put("/api/admin/appointments/:id/cancel", adminAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Appointment not found" });

    if (booking.status === "completed") {
      return res.status(409).json({ message: "Completed appointment cannot be cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.json({ message: "Appointment cancelled" });
  } catch (e) {
    console.error("Cancel appointment error:", e);
    return res.status(500).json({ message: "Failed to cancel appointment" });
  }
});

// ✅ Admin: Delete inquiry
app.delete("/api/admin/inquiries/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await Inquiry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Inquiry not found" });

    return res.json({ message: "Inquiry deleted" });
  } catch (e) {
    console.error("Delete inquiry error:", e);
    return res.status(500).json({ message: "Failed to delete inquiry" });
  }
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

