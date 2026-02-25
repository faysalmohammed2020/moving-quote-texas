"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface PostCardProps {
  image: string;
  title: string;
  body: string;
  link: string;
}

const PostCard: React.FC<PostCardProps> = ({ image, title, body, link }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      {image && (
        <Image
          src={image}
          alt={title}
          width={500}
          height={300}
          className="object-cover rounded-md mb-4"
        />
      )}
      <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
      <p className="text-gray-600 mt-2 text-sm line-clamp-3">{body}</p>
      <Link
        href={link}
        className="text-blue-600 hover:underline mt-4 inline-block font-medium"
      >
        Read more...
      </Link>
    </div>
  );
};

export default PostCard;
