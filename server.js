import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";
import session from "express-session";
import passport from "passport";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt"; // Hash passwords

import "./config/passport.js"; // Passport configuration
import adminRoutes from "./routes/admin.js"; // Admin-related routes
import authRoutes from "./routes/auth.js"; // Auth-related routes
import Member from "./models/Member.js"; // ✅ Import Member Model
import Event from "./models/Event.js";

configDotenv();
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB:", conn.connection.host);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};

connectDB();

// Middleware Setup
app.use(express.static("public"));
app.use("/uploads", express.static(path.join("uploads"))); // Static folder for uploaded files
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Configure Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Multer Setup for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Debug Middleware
app.use((req, res, next) => {
  console.log(req.url, req.isAuthenticated());
  next();
});

// ✅ Routes
app.use("/admin", adminRoutes);
app.use("/admin", authRoutes);

// Home Route
app.get("/", async (req, res) => {
  try {
    const recentEvents = await Event.find({});
    console.log(recentEvents);
    res.render("home", { recentEvents, title: "HOME" });
  } catch (error) {
    console.error(error);
    res.render("home", { recentEvents: [], title: "HOME" }); // Pass an empty array to avoid errors
  }
});

// Contact Route
app
  .route("/contact")
  .get(async (req, res) => {
    try {
      const recentEvents = await Event.find({});
      console.log("RECENT EVENTS", recentEvents);
      res.render("contact", { recentEvents, title: "Contact" });
    } catch (error) {
      console.error(error);
      res.render("contact", { recentEvents: [], title: "Contact" }); // Pass an empty array to avoid errors
    }
  })
  .post(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).send("All fields are required.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.RECEIVER_EMAIL || "admin@example.com",
      subject: `Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send("Message sent successfully.");
    } catch (error) {
      console.error("Error sending email:", error.message);
      res.status(500).send("Failed to send the message.");
    }
  });

// ✅ Membership Form Submission Route
app
  .route("/membership")
  .get(async (req, res) => {
    try {
      const recentEvents = await Event.find({});
      console.log(recentEvents);
      res.render("membership", { recentEvents, title: "MEMBERSHIP" });
    } catch (error) {
      console.error(error);
      res.render("membership", { recentEvents: [], title: "MEMBERSHIP" }); // Pass an empty array to avoid errors
    }
  })
  .post(async (req, res) => {
    try {
      const {
        first_name,
        last_name,
        address_line1,
        address_line2,
        city,
        country,
        state,
        zip_code,
        // is_member,
        // member_id,
        title,
        employer,
        primary_phone,
        primary_email,
        secondary_email,
        professional_associations,
      } = req.body;

      // Validate required fields
      if (
        !first_name ||
        !last_name ||
        !address_line1 ||
        !city ||
        !country ||
        !state ||
        !zip_code ||
        !title ||
        !employer ||
        !primary_phone ||
        !primary_email
      ) {
        console.log(req.body, "validation failed");
        return res.status(400).send("All required fields must be filled!");
      }

      // Check if email already exists
      const existingMember = await Member.findOne({
        primaryEmail: primary_email,
      });
      if (existingMember) {
        return res.status(400).send("Email already registered!");
      }

      // Hash password before saving
      // const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new member document
      const newMember = new Member({
        firstName: first_name,
        lastName: last_name,
        address1: address_line1,
        address2: address_line2,
        city,
        country,
        state,
        zipCode: zip_code,
        // isMember: is_member || false,
        // memberId: member_id || `MEM${Date.now()}`, // Auto-generate member ID if not provided
        title,
        employer,
        primaryPhone: primary_phone,
        primaryEmail: primary_email,
        secondaryEmail: secondary_email,
        professionalAssociations: professional_associations,
      });

      await newMember.save();

      // ✅ Send email notification to the admin
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL, // Your email
          pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
        },
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: "webigeeksofficial@gmail.com",
        subject: "New Member Submission",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
              <img src=${"https://isc2chapter-uae.org/test/logo.png"} alt="Logo" style="width: 120px; margin-bottom: 10px;">
              <h1 style="margin: 0; font-size: 24px;">New Form Submission</h1>
            </div>
            <div style="padding: 20px;">
              <p><strong>Name:</strong> ${first_name} ${last_name}</p>
              <p><strong>Email:</strong> ${primary_email}</p>
              <p><strong>Phone:</strong> ${primary_phone}</p>
              <p><strong>Title:</strong> ${title}</p>
              <p><strong>Employer:</strong> ${employer}</p>
              <p><strong>Country:</strong> ${country}</p>
            </div>
            <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
              <p style="margin: 0;">Thank you for your submission!</p>
              <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} WebiGeeks</p>
            </div>
          </div>
        `,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      res
        .status(201)
        .send("Membership form submitted successfully, and email sent!");
    } catch (err) {
      console.error(
        "Error saving membership form or sending email:",
        err.message
      );
      res.status(500).send("Failed to submit the form or send the email.");
    }
  });

app.route("/events").get(async (req, res) => {
  try {
    const recentEvents = await Event.find({});
    console.log("Events", recentEvents);
    res.render("Events", { recentEvents, title: "EVENTS" });
  } catch (error) {
    console.error(error);
    res.render("Events", { recentEvents: [], title: "EVENTS" }); // Pass an empty array to avoid errors
  }
});

app.get("/about", async (req, res) => {
  try {
    const recentEvents = await Event.find({});
    console.log(recentEvents);
    res.render("about", { recentEvents, title: "ABOUT" });
  } catch (error) {
    console.error(error);
    res.render("about", { recentEvents: [], title: "ABOUT" }); // Pass an empty array to avoid errors
  }
});

app
  .route("/sponsorship")
  .get(async (req, res) => {
    try {
      const recentEvents = await Event.find({});
      console.log(recentEvents);
      res.render("sponsorship", { recentEvents, title: "SPONSORSHIP" });
    } catch (error) {
      console.error(error);
      res.render("sponsorship", { recentEvents: [], title: "SPONSORSHIP" }); // Pass an empty array to avoid errors
    }
  })
  .post(async (req, res) => {
    const { company_name, company_email, subject, message } = req.body;

    if (!company_name || !company_email || !subject || !message) {
      return res.status(400).send("All fields are required.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: "webigeeksofficial@gmail.com",
      subject: `Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Company Name:</strong> ${company_name}</p>
        <p><strong>Company Email:</strong> ${company_email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send("Message sent successfully.");
    } catch (error) {
      console.error("Error sending email:", error.message);
      res.status(500).send("Failed to send the message.");
    }
  });

// ✅ Logout Route
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// ✅ 404 Page Route
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// Server Listener
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
