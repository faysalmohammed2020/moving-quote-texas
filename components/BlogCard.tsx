import React from "react";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";

// Define the Blog type and component props
type Blog = {
  id: number;
  post_title: string;
  post_content: string;
};

type BlogCardProps = {
  blog: Blog;
  onEdit: () => void;
  onDelete: () => void;
};

const BlogCard: React.FC<BlogCardProps> = ({ blog, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="font-medium text-lg text-gray-800">
          {blog.post_title || "Untitled"}
        </h3>
        <p
          className="text-gray-600 text-sm line-clamp-3"
          dangerouslySetInnerHTML={{ __html: blog.post_content }}
        />
      </div>
      <div className="flex gap-2 justify-between items-center">
        <button
          className="text-blue-500 text-sm font-bold flex items-center gap-1"
          onClick={onEdit}
          aria-label="Edit Blog"
        >
          <FaEdit className="text-lg" />
          Edit
        </button>
        <button
          className="text-red-500 text-sm font-bold flex items-center gap-1"
          onClick={onDelete}
          aria-label="Delete Blog"
        >
          <RiDeleteBin6Line className="text-lg" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default BlogCard;
