import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, NavLink } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import "../CSS/Default.css";
import Footer from "../components/footer";

const LoginPage = () => {
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleShowPasswordToggle = () => {
    setShowPassword(!showPassword);
  };
  const handleSignUp = () => {
    navigate("/signup");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("hi");

    try {
      axios.defaults.withCredentials = true;
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, {
        userName,
        password,
      });
      if (response.status === 200) {
        const user = await response.data;
        // Handle successful login
        localStorage.setItem("user", JSON.stringify(user));
        console.log("Login successful:", user);
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.info("Check your Credentials");
        console.error("Login failed");
      }
    } catch (error) {
      toast.error("server error");
      console.error("Error:", error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name } = decoded;

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/googleLogin`, {
        email,
        name
      });

      if (response.data.success) {
        toast.success("Google Login successful!");
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/homepage");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Google login failed on server");
      console.error(error);
    }
  };

  return (
    <>
      <div class="bg-gray-50 font-mono text-[#333]">
        <div class="min-h-screen flex flex-col items-center justify-center py-6 px-4">
          <div class="max-w-md w-full border py-8 px-6 rounded-xl shadow-lg border-gray-300 bg-white">
            <h2 class="text-center text-3xl font-extrabold">Login</h2>
            <form class="mt-10 space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  id="username"
                  value={userName}
                  required
                  class="w-full text-sm px-4 py-3 rounded outline-none border-2 focus:border-gray-500"
                  placeholder="User Name"
                  onChange={handleUsernameChange}
                />
              </div>
              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  required
                  class="w-full text-sm px-4 py-3 rounded outline-none border-2 focus:border-gray-500"
                  placeholder="Password"
                  onChange={handlePasswordChange}
                />
              </div>
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center">
                  <input
                    class="h-4 w-4 ml-1 shrink-0 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    type="checkbox"
                    id="showPasswordCheckbox"
                    checked={showPassword}
                    onChange={handleShowPasswordToggle}
                  />
                </div>
                <label htmlFor="showPasswordCheckbox" class="mr-60">
                  Show password
                </label>
                <div class="mt-2 text-right">
                  <NavLink to="/forgotpassword">
                    <span class="text-blue-600 text-sm font-semibold hover:underline">
                      Forgot your password?
                    </span>
                  </NavLink>
                </div>
              </div>
              {/* 
              <button
                type="submit"
                class="w-full py-2.5 px-4 text-sm rounded text-white bg-gray-600 hover:bg-gray-700 focus:outline-none"
               
              >
                Login
              </button>
              <button
                type="submit"
                class="w-full py-2.5 px-4 text-sm rounded text-white bg-gray-600 hover:bg-gray-700 focus:outline-none"
                
              >
                SignUp Instead
              </button> */}
              <a class="group  relative inline-block text-sm font-medium text-gray-800 focus:outline-none focus:ring active:text-gray-500">
                <span class="absolute inset-0 translate-x-0 translate-y-0 bg-gray-800 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></span>

                <span class="relative block border border-black bg-white px-8 py-2">
                  <button type="submit" onClick={handleSubmit}>
                    Log In
                  </button>
                </span>
              </a>
              <a class="group  relative inline-block text-sm  ml-7 font-medium text-gray-800 focus:outline-none focus:ring active:text-gray-500">
                <span class="absolute inset-0 translate-x-0 translate-y-0 bg-gray-800 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></span>

                <span class="relative block border border-black bg-white px-8 py-2">
                  <button type="submit" onClick={handleSignUp}>
                    Sign Up
                  </button>
                </span>
              </a>

              <div className="mt-8 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    toast.error("Google Login connection failed");
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default LoginPage;
