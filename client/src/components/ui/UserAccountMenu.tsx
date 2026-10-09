import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../lib/useUserProfile";
import {
  User,
  LayoutDashboard,
  Search,
  Globe,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface UserAccountMenuProps {
  align?: "right" | "left";
  className?: string;
}

export const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  align = "right",
  className = "",
}) => {
  const { logout } = useAuth();
  const { user, displayName, initials } = useUserProfile();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close and return focus
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      } else if (e.key === "ArrowDown" && isOpen) {
        e.preventDefault();
        const firstFocusable = menuRef.current?.querySelector<HTMLElement>(
          "a, button"
        );
        firstFocusable?.focus();
      }
    },
    [isOpen]
  );

  if (!user) return null;

  const handleSignOut = async () => {
    setIsOpen(false);
    await logout();
    navigate("/?auth=signin");
  };

  const getDashboardPath = () => {
    if (user.role === "employer") return "/employer/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/student/dashboard";
  };

  const getRoleBadge = () => {
    if (user.role === "admin") {
      return {
        label: "Administrator",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    if (user.role === "employer") {
      return {
        label: "Employer",
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
      };
    }
    return {
      label: "ITI Trainee",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  };

  const badge = getRoleBadge();

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative inline-block text-left ${className}`}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Account navigation menu"
        className="group flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-blue-400 bg-white hover:bg-slate-50 transition-all duration-150 shadow-sm hover:shadow cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 outline-none"
      >
        {/* Compact Avatar / Clean Initials */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm select-none shrink-0 tracking-wider">
          {initials}
        </div>

        {/* User Info Label */}
        <div className="hidden sm:flex flex-col items-start leading-tight text-left">
          <span className="text-xs font-semibold text-gray-800 max-w-[110px] truncate group-hover:text-blue-600 transition-colors">
            {displayName}
          </span>
          <span className="text-[10px] text-gray-500 font-medium capitalize">
            {user.role}
          </span>
        </div>

        {/* Small Dropdown Indicator */}
        <ChevronDown
          size={14}
          className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {/* Polished Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute ${
              align === "right" ? "right-0" : "left-0"
            } mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-gray-200 shadow-xl py-2 z-50 origin-top-right focus:outline-none`}
          >
            {/* Header: User Summary */}
            <div className="px-4 py-3 border-b border-gray-100 bg-slate-50/60 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm select-none shrink-0 tracking-wider">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {displayName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 truncate" title={user.email || undefined}>
                    {user.email || `${user.role} account`}
                  </p>
                </div>
              </div>
              <div className="mt-2.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="py-1">
              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50/70 transition-colors focus-visible:bg-blue-50 focus-visible:text-blue-600 outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">My Profile</span>
                  <span className="text-[11px] text-gray-500">
                    Personal command center
                  </span>
                </div>
              </Link>

              <Link
                to={getDashboardPath()}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50/70 transition-colors focus-visible:bg-blue-50 focus-visible:text-blue-600 outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <LayoutDashboard size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    My Dashboard
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Active workspace
                  </span>
                </div>
              </Link>

              <Link
                to="/jobs"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50/70 transition-colors focus-visible:bg-blue-50 focus-visible:text-blue-600 outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Search size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    Find Opportunities
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Explore industrial jobs &amp; trades
                  </span>
                </div>
              </Link>

              <Link
                to="/"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50/70 transition-colors focus-visible:bg-blue-50 focus-visible:text-blue-600 outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Globe size={15} />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    Job Portal
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Return to public landing page
                  </span>
                </div>
              </Link>
            </div>

            {/* Exit Action */}
            <div className="border-t border-gray-100 pt-1">
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50/70 transition-colors focus-visible:bg-red-50 focus-visible:text-red-700 outline-none cursor-pointer"
              >
                <LogOut size={14} />
                <span>Exit</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
