import express from "express";
import passport from "passport";

const router = express.Router();

// login form
router.get("/login", (req, res) => {
  res.render("Login", { title: "Admin Login" });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin/login",
  })
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/admin/login");
  });
});

export default router;
