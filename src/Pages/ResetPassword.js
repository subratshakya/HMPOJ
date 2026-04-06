import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);
        try {
            const { data } = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/resetpassword/${resetToken}`,
                { password }
            );
            toast.success("Password reset successful!");
            // Optionally store token/user to log them in directly
            // localStorage.setItem("token", data.token);

            // Redirect to login page
            navigate("/login");
        } catch (error) {
            toast.error(
                error.response && error.response.data.error
                    ? error.response.data.error
                    : "Invalid or expired token."
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
                        Reset Password
                    </h2>
                    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full text-sm px-4 py-3 rounded outline-none border-2 focus:border-blue-500 mb-4"
                                placeholder="New Password (min 6 chars)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength="6"
                            />
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                className="w-full text-sm px-4 py-3 rounded outline-none border-2 focus:border-blue-500"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength="6"
                            />
                        </div>

                        <div className="!mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 text-sm font-semibold rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition-colors"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </div>

                        <p className="text-sm mt-6 text-center">
                            <Link
                                to="/login"
                                className="text-blue-600 font-semibold hover:underline ml-1"
                            >
                                Back to Login
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
