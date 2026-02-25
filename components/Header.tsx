"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { VscAccount } from "react-icons/vsc";
import Image from "next/image";
import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface Blog {
  id: number;
  post_title: string;
  _titleLower: string;
}

// ✅ API title-only item shape (add post_status)
type BlogTitleItem = {
  id: number | string;
  post_title?: unknown;
  post_status?: unknown; // ✅ add
};

// ✅ New/Old API response (no any)
type BlogListResponse =
  | { data: BlogTitleItem[]; meta?: Record<string, unknown> } // new API
  | BlogTitleItem[]; // old API

// ✅ AbortError guard (no any)
const isAbortError = (err: unknown) => {
  if (err instanceof DOMException) return err.name === "AbortError";
  if (typeof err === "object" && err !== null && "name" in err) {
    const name = (err as { name?: unknown }).name;
    return name === "AbortError";
  }
  return false;
};

// ✅ slugify helper (root route: /:slug)
function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

// ✅ publish-only checker
const isPublishStatus = (status: unknown) =>
  String(status || "")
    .toLowerCase()
    .trim() === "publish";

const HeaderMenu: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsError, setBlogsError] = useState<string | null>(null);
  const [hasLoadedBlogs, setHasLoadedBlogs] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");

  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = React.useCallback(async () => {
    try {
      await signOut();
    } catch (e: unknown) {
      console.error("Sign out failed", e);
    } finally {
      router.push("/sign-in");
    }
  }, [router]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  /**
   * ✅ Fetch ALL titles reliably (titles=1)
   * ✅ Only show publish posts
   */
  useEffect(() => {
    if (hoveredMenu !== "blogs" || hasLoadedBlogs) return;

    const controller = new AbortController();

    const fetchAllBlogTitles = async () => {
      setBlogsLoading(true);
      setBlogsError(null);

      try {
        const res = await fetch(`/api/blogpost?titles=1`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch titles");

        const raw: BlogListResponse = await res.json();

        const list: BlogTitleItem[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];

        // ✅ ONLY publish items
        const publishOnly = list.filter((item) => isPublishStatus(item?.post_status));

        const mapped: Blog[] = publishOnly
          .map((item) => {
            const title = String(item?.post_title ?? "").trim();
            return {
              id: Number(item.id),
              post_title: title,
              _titleLower: title.toLowerCase(),
            };
          })
          .filter((b) => b.post_title.length > 0);

        setBlogs(mapped);
        setHasLoadedBlogs(true);
      } catch (error: unknown) {
        if (!isAbortError(error)) {
          console.error("Error fetching blogs:", error);
          setBlogsError("Failed to load blogs.");
        }
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchAllBlogTitles();
    return () => controller.abort();
  }, [hoveredMenu, hasLoadedBlogs]);

  const filteredBlogs = useMemo(() => {
    const MAX_RESULTS = 30;
    const q = debouncedQuery.toLowerCase();
    if (!q) return blogs.slice(0, MAX_RESULTS);
    return blogs.filter((b) => b._titleLower.includes(q)).slice(0, MAX_RESULTS);
  }, [blogs, debouncedQuery]);

  const renderHighlightedTitle = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, idx) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={idx} className="text-blue-600">
          {part}
        </span>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  const handleMouseEnter = (menuName: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredMenu(menuName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setHoveredMenu(null), 250);
  };

  return (
    <header className="bg-[#191C27] shadow-md border-b border-gray-300 sticky top-0 left-0 w-full z-50">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6 text-white">
        {/* Logo */}
        <div>
          <Link href="/">
            <Image
              src="/image/Logo.png"
              alt="Company Logo"
              width={386}
              height={59}
              priority
            />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="text-white"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center space-x-10 font-semibold text-lg">
          <li>
            <Link href="/home">Home</Link>
          </li>

          {/* Services Dropdown */}
          <li
            className="group relative"
            onMouseEnter={() => handleMouseEnter("services")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center cursor-pointer">
              <span>Services</span>
              <ChevronDown className="ml-2 w-4 h-4 text-white" />
            </div>
            {hoveredMenu === "services" && (
              <div className="absolute left-0 mt-5 w-72 bg-white text-black shadow-lg rounded-xl p-6">
                <div className="w-full gap-4 pl-2">
                  <div>
                    <div className="py-1">
                      <h5 className="text-lg font-bold mb-2">Our Services</h5>
                      <hr />
                    </div>
                    <ul className="space-y-1 text-md">
                      <li>
                        <Link
                          href="/services/long-distance-moving"
                          className="text-gray-700 hover:text-blue-500"
                        >
                          Long Distance Moving
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/services/auto-transport"
                          className="text-gray-700 hover:text-blue-500"
                        >
                          Auto Transport
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/services/storage-solutions"
                          className="text-gray-700 hover:text-blue-500"
                        >
                          Storage Solutions
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/services/home-changes"
                          className="text-gray-700 hover:text-blue-500"
                        >
                          Home Changes
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* About Dropdown */}
          <li
            className="group relative"
            onMouseEnter={() => handleMouseEnter("about")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center cursor-pointer">
              <span>About Us</span>
              <ChevronDown className="ml-2 w-4 h-4 text-white" />
            </div>
            {hoveredMenu === "about" && (
              <ul className="absolute left-0 mt-2 w-48 bg-white text-black shadow-lg rounded-xl opacity-100">
                <li className="px-4 py-2 hover:text-blue-600">
                  <Link href="/about-us/testimonial">Testimonials</Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link href="/contact">Contact</Link>
          </li>

          {/* Blog Dropdown */}
          <li
            className="group relative"
            onMouseEnter={() => handleMouseEnter("blogs")}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/blog" className="flex items-center">
              <span>Blog</span>
              <ChevronDown className="ml-2 w-4 h-4 text-white" />
            </Link>

            {hoveredMenu === "blogs" && (
              <div className="absolute -left-32 mt-5 w-[450px] bg-white text-black shadow-lg rounded-xl p-4">
                <div className="flex">
                  {/* Left promo */}
                  <div className={`w-1/3 ${isHovered ? "hidden" : "block"}`}>
                    <Image
                      src="/image/delevery4.jpg"
                      alt="Explore Blogs"
                      height={120}
                      width={120}
                      className="rounded-md mb-4"
                    />
                    <h4 className="text-lg font-bold">Explore Blogs</h4>
                    <p className="text-gray-600">
                      Discover insights, tips, and stories on a variety of topics.
                    </p>
                  </div>

                  {/* Right list */}
                  <div
                    className={`${
                      isHovered ? "w-full" : "w-2/3"
                    } gap-4 pl-6 overflow-y-auto h-96`}
                  >
                    <div
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <div>
                        <input
                          type="text"
                          placeholder="Search blogs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-2 py-1 pl-12 rounded-xl bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-orange-500 shadow-sm border border-orange-600 transition-all duration-300"
                        />
                        <hr />
                      </div>

                      <div className="scrollbar mt-4 space-y-3">
                        {blogsLoading ? (
                          <p className="text-gray-500 text-sm">Loading blogs...</p>
                        ) : blogsError ? (
                          <p className="text-red-600 text-sm">{blogsError}</p>
                        ) : filteredBlogs.length > 0 ? (
                          filteredBlogs.map((blog) => {
                            const blogSlug = slugify(blog.post_title || "");
                            return (
                              <div
                                key={blog.id}
                                className="group p-2 rounded-xl hover:from-orange-500 hover:to-orange-900 transition-colors duration-300 ease-in-out shadow-md"
                              >
                                <Link
                                  href={`/${encodeURIComponent(blogSlug)}`}
                                  className="text-sm sm:text-base font-medium text-gray-800 hover:underline hover:text-orange-600"
                                >
                                  {renderHighlightedTitle(blog.post_title, debouncedQuery)}
                                </Link>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-red-800 text-sm">No blogs found...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </li>
        </ul>

        {/* Right section */}
        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <button
              onClick={handleSignOut}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <Link href="/sign-in">
              <Button className="px-2 py-1 rounded-full border font-semibold">
                Sign In
              </Button>
            </Link>
          )}
          <button className="p-2 rounded-full">
            <VscAccount className="size-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <ul className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col text-lg md:hidden">
          <li className="px-4 py-2 border-b">
            <Link href="/">Home</Link>
          </li>
          <li className="px-4 py-2 border-b">
            <Link href="/services/long-distance-moving">Services</Link>
          </li>
          <li className="px-4 py-2 border-b">
            <Link href="/about-us/testimonial">About Us</Link>
          </li>
          <li className="px-4 py-2 border-b">
            <Link href="/contact">Contact</Link>
          </li>
          <li className="px-4 py-2 border-b">
            <Link href="/blog">Blog</Link>
          </li>
        </ul>
      )}
    </header>
  );
};

export default HeaderMenu;
