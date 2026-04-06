const axios = require("axios");

async function runTest() {
    try {
        // 1. Create a fake user
        const uniqueVal = Date.now();
        const email = `testuser${uniqueVal}@example.com`;
        console.log("Creating test user:", email);

        await axios.post("http://localhost:5000/api/signup", {
            name: "Test User",
            userName: `user${uniqueVal.toString().slice(-4)}`,
            email: email,
            password: "password123"
        });
        console.log("User created successfully!");

        // 2. Request Password Reset
        console.log("Requesting password reset for:", email);
        const res = await axios.post("http://localhost:5000/api/forgotpassword", {
            email: email
        });

        console.log("Forgot Password API response:", res.data);

        console.log("\nSuccess! The backend should have printed an Ethereal Preview URL in its console.");
    } catch (err) {
        console.error("Test failed:", err.response ? err.response.data : err.message);
    }
}

runTest();
