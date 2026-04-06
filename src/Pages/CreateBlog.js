import React from "react";
import AddBlogForm from "../components/blogAdd";
import Footer from "../components/footer";
import Header from "../components/header";

const BlogCreate = () => {
  return (
    <div>
      <Header />
      <AddBlogForm />
      <Footer />
    </div>
  );
};

export default BlogCreate;
