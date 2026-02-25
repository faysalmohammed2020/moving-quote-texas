import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#191C27] text-white py-6 shadow-t-sm">
      <div className="container mx-auto text-center">
        {/* Navigation Links */}
        <nav className="mb-4">
          <Link href="/" className="mx-3 hover:text-gray-800">
            Home
          </Link>
          <Link href="/services/long-distance-moving" className="mx-3 hover:text-gray-800">
            Services
          </Link>
          <Link
            href="/about-us/testimonial"
            className="mx-3 hover:text-gray-800"
          >
            About Us
          </Link>
          <Link href="/contact" className="mx-3 hover:text-gray-800">
            Contact
          </Link>
          <Link href="/blog" className="mx-3 hover:text-gray-800">
            Blog
          </Link>
        </nav>

        {/* Copyright Section */}
        <p className="text-sm mb-4">
          © 2025 Moving Quote Services. All Rights Reserved.
        </p>

        {/* Social Media Icons */}
        <div className="flex justify-center space-x-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-gray-200 text-gray-600 flex items-center justify-center rounded-full hover:bg-gray-300 transition"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-gray-200 text-gray-600 flex items-center justify-center rounded-full hover:bg-gray-300 transition"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-gray-200 text-gray-600 flex items-center justify-center rounded-full hover:bg-gray-300 transition"
          >
            <Twitter className="w-6 h-6" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-gray-200 text-gray-600 flex items-center justify-center rounded-full hover:bg-gray-300 transition"
          >
            <Youtube className="w-6 h-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
