// models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventDescription: { type: String, required: true },
  eventVenue: { type: String, required: true },
  eventDateTime: { type: Date, required: true, index: { expires: 0 } },
  eventImage: { type: String, required: true },
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
