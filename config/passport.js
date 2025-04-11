import passport from "passport";
import LocalStrategy from "passport-local";
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      const admin = await Admin.findOne({ username });
      if (!admin) {
        return cb(null, false, { message: "Invalid Username" });
      }
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return cb(null, false, { message: "Invalid Password" });
      }
      return cb(null, admin);
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  console.log("Serializing user:", user.id);
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  const admin = await Admin.findById(id);
  cb(null, admin);
});
