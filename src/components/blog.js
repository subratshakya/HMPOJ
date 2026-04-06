import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import LoadingComponent from "./loading";

import axios from "axios";
const Blogs = () => {
  const [blogRes, setBlogRes] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/blogs`);
        setBlogRes(res);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingComponent />;
  if (error) return <p>Error!</p>;

  return (
    <div className="font-mono w-full bg-[#f9f9f9] py-[50px]">
      <div className="font-mono max-w-[1240px] mx-auto">
        <div className="font-mono grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 ss:grid-cols-1 gap-8 px-4 text-black">
          {blogRes.data.data.map((blog) => (
            <Link key={blog._id} to={`/blog/${blog._id}`}>
              <article className="group" alt={blog.blogTitle}>
                <img
                  alt=""
                  src="https://i.pinimg.com/736x/d6/61/16/d6611692bb0513cb6b347eb7eba95ad1.jpg"
                  className="h-56 w-full rounded-xl object-cover shadow-xl transition group-hover:grayscale-[50%]"
                />

                <div className="p-4">
                  <a href="#">
                    <h3 className="text-lg font-medium text-gray-900" >{blog.blogTitle}</h3>
                  </a>

                  <p className="mt-2 line-clamp-3 text-sm/relaxed text-gray-500">
                    {blog.blogDesc}
                  </p>
                </div>
              </article>
            </Link>
          ))}
          <NavLink exact to="/createBlog" onClick={handleClick}>
            <div className="font-mono fixed bottom-40 right-10">
              <button className="font-mono bg-gray-500 rounded-full font-mono font-bold text-xl text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-300 shadow-xl">
                +
              </button>
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
{/* <Link key={blog._id} to={`/blog/${blog._id}`}>
              <div className="font-mono bg-white rounded-xl overflow-hidden drop-shadow-md">
                <img
                  className="font-mono h-56 w-full object-cover"
                  src={`https://img.freepik.com/free-photo/toy-bricks-table_144627-48267.jpg?w=1060&t=st=1710578482~exp=1710579082~hmac=96da3e2ff43cf0872c21a635d91cbf095ef7f24ea7048e3d28f1df931dda84db`}
                  alt={blog.blogTitle}
                />
                <div className="font-mono p-8">
                  <h3 className="font-mono font-bold text-2xl my-1">
                    
                  </h3>
                  <p className="font-mono text-gray-600 text-xl">
                    
                  </p>
                </div>
              </div>
            </Link> */}