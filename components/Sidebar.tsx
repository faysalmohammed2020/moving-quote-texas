"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { sidebarItems, SidebarItem } from "@/app/data/sidebarData";
import {
  LuArrowLeftFromLine,
  LuArrowRightToLine,
  LuChevronRight,
  LuLogOut,
  LuUser,
} from "react-icons/lu";

import { signOut, useSession } from "@/lib/auth-client";

type AppUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatar?: string | null;
  image?: string | null; // ✅ fallback support
};

type AppSession = {
  user?: AppUser | null;
};

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const user = (session as unknown as AppSession | null)?.user;

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHoverLabel, setShowHoverLabel] = useState<string | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (): void => {
    setIsCollapsed((prev) => !prev);
    setShowProfileMenu(false);
  };

  const pathname = usePathname();
  const isActive = (path: string): boolean => pathname === path;
  const isParentActive = (item: SidebarItem): boolean => {
    if (item.subItems) {
      return item.subItems.some((sub) => pathname?.startsWith(sub.href));
    }
    return false;
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

 const avatarUrl = user?.image || null; // ✅ unified

  const handleMouseEnter = (label: string) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      if (isCollapsed) setShowHoverLabel(label);
    }, 300);
    setHoverTimeout(timeout as unknown as NodeJS.Timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setShowHoverLabel(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in");
    } catch (e) {
      console.error("Sign out failed", e);
    }
  };

  return (
    <>
      {/* Hover Tooltip for collapsed state */}
      {showHoverLabel && isCollapsed && (
        <div className="fixed left-[72px] z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm font-medium animate-in slide-in-from-left-1">
          {showHoverLabel}
        </div>
      )}

      <aside
        className={`flex flex-col shrink-0 ${
          isCollapsed ? "w-[72px]" : "w-72"
        } transition-all duration-300 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 h-screen backdrop-blur-sm`}
        onMouseLeave={() => setShowHoverLabel(null)}
      >
        {/* Logo and Toggle Section */}
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
          )}

          <button
            onClick={toggleMenu}
            className={`p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 ${
              isCollapsed ? "mx-auto" : ""
            }`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <LuArrowRightToLine className="size-5 text-slate-300" />
            ) : (
              <LuArrowLeftFromLine className="size-5 text-slate-300" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 py-6 grow overflow-y-auto">
          <ul className="space-y-1">
            {sidebarItems.map((item: SidebarItem) => {
              const active = isActive(item.href) || isParentActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                    className={`flex items-center font-medium rounded-xl transition-all duration-200 ${
                      isCollapsed ? "justify-center py-3" : "px-4 py-3 gap-3"
                    } ${
                      active
                        ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-400 border-l-4 border-cyan-500"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/30"
                    } group relative`}
                  >
                    <div
                      className={`${
                        active
                          ? "text-cyan-400"
                          : "text-slate-400 group-hover:text-cyan-300"
                      } transition-colors`}
                    >
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.subItems && (
                          <LuChevronRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                        )}
                      </>
                    )}

                    {/* Active indicator dot for collapsed state */}
                    {active && isCollapsed && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 bg-cyan-400 rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div
          className="px-3 py-4 border-t border-slate-700/50"
          ref={profileMenuRef}
        >
          <div className="relative">
            <button
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "justify-between"
              } w-full gap-3 p-2 rounded-xl hover:bg-slate-700/50 transition-all group`}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              onMouseEnter={() => handleMouseEnter(user?.name || "Profile")}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user?.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                </div>

                {!isCollapsed && (
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-100 transition-colors">
                      {user?.name || "User"}
                    </h3>
                    <p className="text-xs text-slate-300 capitalize">
                      {user?.role?.toLowerCase() || "user"}
                    </p>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>

            {/* ✅ Enhanced Profile Dropdown */}
            {showProfileMenu && (
              <div
                className={`absolute ${
                  isCollapsed ? "left-14" : "right-0"
                } bottom-16 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-sm animate-in slide-in-from-bottom-2`}
              >
                {/* Header (with avatar) */}
                <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-600 bg-slate-700 flex items-center justify-center text-white font-semibold shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user?.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>

                {/* ✅ Profile link */}
                <Link
                  href="/admin/dashboard/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700/50 transition-all rounded-lg mx-1"
                >
                  <LuUser className="size-4" />
                  <span>My Profile</span>
                </Link>

                {/* Divider */}
                <div className="my-2 border-t border-slate-700/70" />

                {/* Sign Out */}
                <button
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all rounded-lg mx-1"
                  onClick={handleSignOut}
                >
                  <LuLogOut className="size-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;