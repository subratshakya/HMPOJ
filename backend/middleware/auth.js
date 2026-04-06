const GoogleStrategy = require("passport-google-oauth20").Strategy;
//const passport = require("passport");
// Import dotenv package
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
// Specify the path to the .env file
const path = require("path");
const envPath = path.join(__dirname, "..", "..", ".env"); // Construct the path to .env file

// Load environment variables from the .env file
// dotenv.config({ path: envPath });
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       callbackURL: "/api/auth/success",
//       passReqToCallback: true,
//     },
//     function (accessToken, refreshToken, profile, callback) {
//       return done(err, profile);
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });
// passport.deserializeUser((user, done) => {
//   done(null, user);
// });
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/userModels");

// check is user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
};

//middleware for admin
exports.isAdmin = async (req, res, next) => {
  // Get the token from the cookie
  const token = req.cookies.token;

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return next(new ErrorResponse("Access denied, invalid token", 401));
    }

    try {
      // Fetch the user object using the ID from the token
      const user = await User.findById(decoded.id);

      // Check if the user's role is admin (assuming 0 is admin role)
      if (user.role === 0) {
        return next(
          new ErrorResponse("Access denied, you must be an admin", 403)
        );
      }

      // Set the user in the request for future use
      req.user = user;
      next();
    } catch (error) {
      return next(new ErrorResponse("Error fetching user", 500));
    }
  });
};
