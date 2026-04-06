const express = require("express");
const router = express.Router();

//api calling
const { signup, login, logout, userProfile, forgotPassword, resetPassword, googleLogin } = require("../controllers/authControllers");
const { isAuthenticated } = require("../middleware/auth")

//routes

//signup
router.post("/signup", signup);

//login
router.post("/login", login);

//google login
router.post("/googleLogin", googleLogin);

//logout
router.get("/logout", logout);

//profile
router.get("/me", isAuthenticated, userProfile);

// forgot password
router.post("/forgotpassword", forgotPassword);

// reset password
router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;



