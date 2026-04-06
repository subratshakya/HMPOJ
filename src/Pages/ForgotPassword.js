import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/forgotpassword`,
                { email }
            );
            if (data.previewUrl) {
                toast.success("Test Email generated! Check browser console for the URL.");
                console.log("----- DEV TESTING MODE -----");
                console.log("Open this URL to view the Reset Password Email:");
                console.log(data.previewUrl);
                console.log("----------------------------");
            } else {
                toast.success(data.data || "Email sent successfully");
            }
        } catch (error) {
            toast.error(
                error.response && error.response.data.error
                    ? error.response.data.error
                    : "Could not send email. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 font-mono text-[#333]">
            <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
                <div className="max-w-md w-full border py-8 px-6 rounded-xl shadow-lg border-gray-300 bg-white">
                    <h2 className="text-center text-3xl font-extrabold pb-4">
                        Forgot Password
                    </h2>
                    <p className="text-center text-sm text-gray-500 mb-6">
                        Enter your email and we'll send you a link to reset your password.
                    </p>
                    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full text-sm px-4 py-3 rounded outline-none border-2 focus:border-blue-500"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="!mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 text-sm font-semibold rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition-colors"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </div>

                        <p className="text-sm mt-6 text-center">
                            Remembered your password?{" "}
                            <Link
                                to="/login"
                                className="text-blue-600 font-semibold hover:underline ml-1"
                            >
                                Login here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
