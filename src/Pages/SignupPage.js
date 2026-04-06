import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "../CSS/LoginPage.css";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      toast.error("Passwords do not match");
    } else {
      setPasswordError(""); // Reset password error state if passwords match
      try {
        axios.defaults.withCredentials = true;
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/signup`,
          formData
        );

        if (response.status === 200) {
          const user = response.data;
          // Handle successful signup
          console.log("signup successful:", user);
          toast.success("Signup successful!");
          navigate("/login");
        } else {
          // Handle signup failure
          console.error("Signup failed");
          toast.error("Signup failed");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error occurred during signup");
      }
    }
  };

  return (
    <>
      <div className="loginbody">
        <div className="wrapper">
          <div className="form-box login">
            <h2 class="font-mono">Sign Up</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-box">
                <label htmlFor="name" class="font-mono">
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <label htmlFor="userName" class="font-mono">
                  userName:
                </label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <label htmlFor="email" class="font-mono">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <label htmlFor="password" class="font-mono">
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-box">
                <label htmlFor="confirmPassword" class="font-mono">
                  Confirm Password:
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
              </div>

              {passwordError && (
                <p className="error-message">{passwordError}</p>
              )}
              <a class="group  relative inline-block text-sm font-medium text-gray-800 focus:outline-none focus:ring active:text-gray-500">
                <span class="absolute inset-0 translate-x-0 translate-y-0 bg-gray-800 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></span>

                <span class="relative block border border-black bg-white px-8 py-2">
                  <button type="submit">Sign Up</button>
                </span>
              </a>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
