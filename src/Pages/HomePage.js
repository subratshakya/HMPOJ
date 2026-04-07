import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/footer";
import Header from "../components/header";
import LeaderboardComponent from "../components/leaderboard";

import axios from "axios";
const Homepage = () => {
  const [error, setError] = useState(null);
  const nav = useNavigate();
  const handleproblemset = () => {
    nav("/problemset");
  };
  const blogClick = () => {
    nav("/blogs");
  };
  const randomProblem = () => {
    const fetchRandomProblem = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/randomProblem`
        );
        nav(`/problem/${response.data.problemId}`);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchRandomProblem();
  };
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user = JSON.parse(storedUser);

    //console.log("User data:", user);
  } else {
    console.log("not logged in");
    // User data not found in localStorage, handle accordingly
  }

  return (
    <>
      <Header />
      <section className="container mx-auto px-8 py-8 lg:py-20">
        <h2 className="block antialiased tracking-normal font-mono text-4xl font-semibold leading-[1.3] text-blue-gray-900 !text-3xl !leading-snug lg:!text-4xl text-left">
          Embark on your coding adventure today.
        </h2>
        <p className="block antialiased font-mono text-xl font-normal leading-relaxed text-inherit mt-2 w-full  !text-gray-500 lg:w-5/12 text-left">
          Start Coding.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-4">
          <div
            className="relative flex flex-col bg-clip-border rounded-xl bg-transparent text-gray-700 shadow-md relative grid min-h-[30rem] items-end overflow-hidden rounded-xl"
            onClick={handleproblemset}
          >
            <img
              src="https://i.pinimg.com/originals/91/a3/9e/91a39e3eb213b809ebe5b888c6a97126.gif"
              alt="bg"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="p-6 relative flex flex-col justify-end">
              <h4 className="block antialiased tracking-normal font-mono text-2xl font-semibold leading-snug text-white">
                Practice Problem
              </h4>
            </div>
          </div>
          <div
            className="relative flex flex-col bg-clip-border rounded-xl bg-transparent text-gray-700 shadow-md relative grid min-h-[30rem] items-end overflow-hidden rounded-xl"
            onClick={blogClick}
          >
            <img
              src="https://i0.wp.com/giffiles.alphacoders.com/425/4256.gif"
              alt="bg"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="p-6 relative flex flex-col justify-end">
              <h4 className="block antialiased tracking-normal font-mono text-2xl font-semibold leading-snug text-white">
                Blog
              </h4>
            </div>
          </div>
          <div
            className="relative flex flex-col bg-clip-border rounded-xl bg-transparent text-gray-700 shadow-md relative grid min-h-[30rem] items-end overflow-hidden rounded-xl"
            onClick={randomProblem}
          >
            <img
              src="https://i.pinimg.com/originals/25/81/28/258128ed71595efc9b561ed7d88b89f2.gif"
              alt="bg"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="p-6 relative flex flex-col justify-end">
              <h4 className="block antialiased tracking-normal font-mono text-2xl font-semibold leading-snug text-white">
                Random Problem
              </h4>
            </div>
          </div>
          <div
            className="relative flex flex-col bg-clip-border rounded-xl bg-transparent text-gray-700 shadow-md relative grid min-h-[30rem] items-end overflow-hidden rounded-xl cursor-pointer"
            onClick={() => nav("/engineering")}
          >
            <img
              src="/Engineering.gif"
              alt="Engineering bg"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="p-6 relative flex flex-col justify-end">
              <span className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-1">Deep Dive</span>
              <h4 className="block antialiased tracking-normal font-mono text-2xl font-semibold leading-snug text-white">
                Engineering
              </h4>
            </div>
          </div>
        </div>
      </section>

      <div className="m-5">
        <LeaderboardComponent />
      </div>

      <Footer />
    </>
  );
};

export default Homepage;
