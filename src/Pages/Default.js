// DefaultPage.js

import React from "react";
import Footer from "../components/footer";
import Header from "../components/header";
import videoSource from "../images/huh-mp4.mp4"; // Import your video file

const DefaultPage = () => {
  return (
    <>
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh", // Change height to minHeight for better responsiveness
          backgroundColor: "#f0f0f0", // Add a background color
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ marginBottom: "20px" }}>404 - Page Not Found</h1>
          <p style={{ marginBottom: "20px" }}>
            The page you are looking for does not exist.
          </p>
          <video
            autoPlay
            loop
            style={{ width: "160%", maxWidth: "800px", borderRadius: "8px" }} // Adjust video width and add border radius
          >
            <source src={videoSource} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DefaultPage;
