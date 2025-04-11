import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
});

const Admin = mongoose.model("Admin", userSchema);

const createAdmin = async () => {
  const dbURI =
    process.env.MONGO_URI ||
    "mongodb+srv://Admin-Rohan:adminrohansharma@cluster0.2vxj1.mongodb.net/isc2uaeDB";
  // "mongodb://localhost:27017/isc2uaeDB";
  try {
    await mongoose.connect(dbURI);
    console.log("Connected to database");

    const name = "admin";
    const username = "admin@example.com";
    const password = "helloworld";

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      console.log(`Admin User Already Exists: ${existingAdmin.username}`);
      return;
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed.");

    const admin = new Admin({
      name,
      username,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("Admin user created successfully.");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    try {
      console.log("Closing database connection...");
      await mongoose.connection.close();
      console.log("Database connection closed.");
    } catch (err) {
      console.error("Error closing database connection:", err);
    }
  }
};

createAdmin();
