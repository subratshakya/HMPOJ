import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import LoadingComponent from "./loading";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { NavLink } from "react-router-dom";
const BlogContent = () => {
  const id = useParams();

  const [blog, setBlog] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/blogs/${id.blogid}`
        );
        setBlog(res);

        setLoading(false);
      } catch (error) {
        setError(error);
        //console.log(error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingComponent />;
  if (error) return <p>Error!</p>;

  return (
    <div className="font-mono w-full pb-10 bg-gray-100">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="col-span-2">
            <img
              className="w-full h-56 rounded-lg object-cover shadow-md"
              src="https://preview.redd.it/injl33v9myl51.jpg?width=1080&crop=smart&auto=webp&s=7c193242bc6bc2201d2108fee340ea934d3b5899"
              alt={blog?.data?.data?.blogTitle}
            />
            <h1 className="font-bold text-2xl my-4">
              {blog?.data?.data?.blogTitle}
            </h1>
            <div
              className="text-gray-800"
              dangerouslySetInnerHTML={{
                __html: blog?.data?.data?.blogContent,
              }}
            />
          </div>
          {/* <NavLink exact to= "/" */}
          <div className="bg-white rounded-xl p-5">
            <div className="flex flex-col items-center">
              <img
                className="w-24 h-24 rounded-full object-cover"
                src={`https://robohash.org/${blog?.data?.data?.authorName}?size=150x150`}
                alt={blog?.data?.data?.authorName}
              />
              <NavLink exact>
                <h1 className="font-bold text-xl text-gray-900 my-3">
                  {blog?.data?.data?.authorName}
                </h1>
              </NavLink>
              <p className="text-gray-700">{blog?.data?.data?.authorDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogContent;
