import express from "express";
import Event from "../models/Event.js";
import { upload } from "../config/multer.js";
import Member from "../models/Member.js";

const router = express.Router();

// Middleware to check if the user is authenticated
const ensureAuthenticated = (req, res, next) => {
  console.log("User session:", req.session);
  console.log("User authenticated:", req.isAuthenticated());
  console.log("User info:", req.user);
  if (req.isAuthenticated()) return next();
  res.redirect("/admin/login");
};

// Admin dashboard route
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    const events = await Event.find({});
    const eventCount = await Event.countDocuments();
    const memberCount = await Member.countDocuments();

    res.render("Dashboard", {
      title: "Admin Dashboard",
      eventCount,
      events,
      memberCount,
    });
  } catch (error) {
    console.error("Error Fetching Dashboard Data", error);
    res.status(500).send("Error Loading Dashboard");
  }
});

// Create event route (GET)
router.get("/create-event", ensureAuthenticated, (req, res) => {
  res.render("CreateEvent", { title: "Create Event" });
});

// Delete Event
router.get("/delete-event/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error Deleting event:", error);
    res.status(500).send("Error Deleting event. Please try again.");
  }
});

// Create event route (POST)
router.post(
  "/create-event",
  ensureAuthenticated,
  upload.single("eventImage"),
  async (req, res) => {
    try {
      // Check if all required fields are present
      const { eventName, eventDescription, eventVenue, eventDateTime } =
        req.body;
      if (!eventName || !eventDescription || !eventVenue || !eventDateTime) {
        return res.status(400).send("All fields are required!");
      }

      // Check if the file is uploaded
      if (!req.file) {
        return res.status(400).send("Event image is required.");
      }

      // Ensure the event date is valid
      const eventDate = new Date(eventDateTime);
      if (isNaN(eventDate)) {
        return res.status(400).send("Invalid event date format.");
      }

      // Create a new event document
      const newEvent = new Event({
        eventName,
        eventDescription,
        eventVenue,
        eventDateTime: eventDate,
        eventImage: req.file.path, // Store the uploaded file path
      });

      // Save the event to the database
      await newEvent.save();
      console.log("Event created:", newEvent); // Log event creation
      res.redirect("/admin/dashboard");
    } catch (error) {
      // Log the error and send a 500 response
      console.error("Error creating event:", error);
      res.status(500).send("Error creating new event. Please try again.");
    }
  }
);

export default router;
