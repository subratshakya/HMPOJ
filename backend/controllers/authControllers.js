const User = require("../models/userModels");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

exports.signup = async (req, res, next) => {
  // Whitelist only the fields we expect
  const { name, userName, email, password } = req.body;

  const userExist = await User.findOne({ email });
  const usernameExist = await User.findOne({ userName });
  if (userExist) {
    return next(new ErrorResponse("E-mail already registered", 420));
  }
  if (usernameExist) {
    return next(new ErrorResponse("Username already exist", 420));
  }
  try {
    const user = await User.create({ name, userName, email, password });
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    if (!userName) {
      return next(new ErrorResponse("please add an username", 403));
    }
    if (!password) {
      return next(new ErrorResponse("please add a password", 403));
    }

    const user = await User.findOne({ userName });
    if (!user) {
      return next(new ErrorResponse("invalid credentials", 400));
    }
    const isMatched = await user.comparePassword(password);
    if (!isMatched) {
      return next(new ErrorResponse("invalid credentials", 400));
    }
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const sendTokenResponse = async (user, codeStatus, res) => {
  const token = await user.getJwtToken();
  const isProduction = process.env.NODE_ENV === "production";
  res
    .status(codeStatus)
    .cookie("token", token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    })
    .json({
      token,
      user,
      success: true,
      role: user.role,
    });
};

// log out
exports.logout = (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "logged out",
  });
};

// Google Login / Signup
exports.googleLogin = async (req, res, next) => {
  const { email, name } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Create new account automatically if it's their first time signing in with Google
      const generatedPassword = crypto.randomBytes(16).toString("hex");

      // Auto-generate a valid userName (no spaces, max 12 chars per your DB schema)
      const baseUserName = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 7).toLowerCase();
      const userName = `${baseUserName}${Math.floor(10000 + Math.random() * 90000)}`;

      user = await User.create({
        name,
        userName,
        email,
        password: generatedPassword,
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// user profile
exports.userProfile = async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json({
    success: true,
    user,
  });
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const frontendOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
  const resetUrl = `${frontendOrigin}/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    const previewUrl = await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent", previewUrl });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
};
