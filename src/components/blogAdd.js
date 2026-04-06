import React, { useState } from "react";
import ReactQuill from "react-quill";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import axios from "axios";

const AddBlogForm = () => {
  const Navigate = useNavigate();
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDesc, setBlogDesc] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [authorDesc, setAuthorDesc] = useState("");
  const [error, setError] = useState(null);
  let authorName = "";
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const userData = JSON.parse(storedUser);
    authorName = userData.user.userName;
  }

  const handleTitleChange = (event) => {
    setBlogTitle(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setBlogDesc(event.target.value);
  };

  const handleContentChange = (content) => {
    setBlogContent(content);
  };

  const handleAuthorDescChange = (event) => {
    setAuthorDesc(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Send form data to backend
    const formData = {
      blogTitle,
      blogDesc,
      blogContent,
      authorName,
      authorDesc,
    };

    try {
      axios.defaults.withCredentials = true;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/createBlog`,
        formData
      );
      toast.success("Blog Created");
      Navigate("/blogs");
      // Response from the server
      // Optionally, redirect to another page or show a success message
    } catch (error) {
      console.error("Error:", error);
      if (error.response && error.response.status === 403) {
        toast.info("Please log in first.");
        setError("You are not authorized.");
      }
      // Handle error (e.g., show error message to the user)
    }
  };
  return (
    <div className="font-mono container mx-auto px-4 py-8">
      {error ? (
        <p className="font-mono text-red-500 text-lg font-semibold">{error}</p>
      ) : (
        <form onSubmit={handleSubmit} className="font-mono max-w-3xl mx-auto">
          <div className="font-mono mb-4">
            <label
              htmlFor="blogTitle"
              className="font-mono block text-gray-700 font-bold"
            >
              Title:
            </label>
            <input
              type="text"
              id="blogTitle"
              value={blogTitle}
              onChange={handleTitleChange}
              className="font-mono mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
            />
          </div>
          <div className="font-mono mb-4">
            <label
              htmlFor="blogDesc"
              className="font-mono block text-gray-700 font-bold"
            >
              Description:
            </label>
            <input
              type="text"
              id="blogDesc"
              value={blogDesc}
              onChange={handleDescriptionChange}
              className="font-mono mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
            />
          </div>
          <div className="font-mono mb-4">
            <label
              htmlFor="blogContent"
              className="font-mono block text-gray-700 font-bold"
            >
              Content:
            </label>
            <ReactQuill
              value={blogContent}
              onChange={handleContentChange}
              className="font-mono mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div className="font-mono mb-4">
            <label
              htmlFor="authorDesc"
              className="font-mono block text-gray-700 font-bold"
            >
              Author Description:
            </label>
            <input
              type="text"
              id="authorDesc"
              value={authorDesc}
              onChange={handleAuthorDescChange}
              className="font-mono mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
            />
          </div>
          <button
            type="submit"
            className="font-mono bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default AddBlogForm;
