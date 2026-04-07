// Deployment Trigger: Force Vercel Build with CI=false
import "./App.css";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import Homepage from "./Pages/HomePage";
import SubmissionPage from "./Pages/SubmitPage";
import Dashboard from "./Pages/Dashboard";
import ProblemSet from "./Pages/ProblemSet";
import DefaultPage from "./Pages/Default";
import ProblemPage from "./Pages/ProblemPage";
import BlogPage from "./Pages/Blogs";
import ProblemForm from "./Pages/CreateProblem";

import Contact from "./Pages/Contact.js";
import BlogShow from "./Pages/BlogShow";
import AddBlogForm from "./components/blogAdd";
import BlogCreate from "./Pages/CreateBlog";
import Chatroom from "./Pages/Chat";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Engineering from "./Pages/Engineering";
import ContestHub from "./Pages/ContestHub";
import ContestArena from "./Pages/ContestArena";
import ContestLeaderboard from "./Pages/ContestLeaderboard";
import CreateContest from "./Pages/CreateContest";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword/:resetToken" element={<ResetPassword />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/contact" element={<Contact />}></Route>
          <Route
            path={`/submit/:problemid`}
            element={<SubmissionPage />}
          ></Route>
          <Route path="/blogs" element={<BlogPage />}></Route>

          <Route path={"/blog/:blogid"} element={<BlogShow />}></Route>
          <Route path={`/profile/:username`} element={<Dashboard />}></Route>
          <Route path="/problemset" element={<ProblemSet />}></Route>

          <Route path="/contests" element={<ContestHub />}></Route>
          <Route path="/contest/:contestid" element={<ContestArena />}></Route>
          <Route path="/contest/:contestid/leaderboard" element={<ContestLeaderboard />}></Route>
          <Route path="/contest/:contestid/submit/:problemid" element={<SubmissionPage />}></Route>
          <Route path="/contest/:contestid/problem/:problemid" element={<ProblemPage />}></Route>
          <Route path="/admin/contest/create" element={<CreateContest />}></Route>

          <Route path={`/problem/:problemid`} element={<ProblemPage />}></Route>
          <Route path={"/createblog"} element={<BlogCreate />}></Route>
          <Route path={"/createProblem"} element={<ProblemForm />}></Route>
          <Route path="/chat" element={<Chatroom />}></Route>
          <Route path="/engineering" element={<Engineering />}></Route>
          <Route path="*" element={<DefaultPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
