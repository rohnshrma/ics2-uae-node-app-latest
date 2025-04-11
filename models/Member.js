import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },

    title: { type: String, required: true }, // Mr, Mrs, Dr, etc.
    employer: { type: String, required: true },
    primaryPhone: { type: String, required: true },
    primaryEmail: { type: String, required: true, unique: true },
    secondaryEmail: { type: String },

    // isMember: { type: Boolean, default: false },
    // memberId: { type: String, unique: true }, // Unique Membership ID

    professionalAssociations: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Member", MemberSchema);
