import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../lib/useUserProfile";
import { UserAccountMenu } from "./UserAccountMenu";
import {
  Briefcase,
  LogOut,
  Menu,
  X,
  Search,
  MapPin,
  User,
  LayoutDashboard,
  Globe,
} from "lucide-react";

export const AppNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { displayName, initials } = useUserProfile();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [navKeyword, setNavKeyword] = useState(searchParams.get("keyword") || "");
  const [navLocation, setNavLocation] = useState(searchParams.get("location") || "");

  useEffect(() => {
    setNavKeyword(searchParams.get("keyword") || "");
    setNavLocation(searchParams.get("location") || "");
  }, [searchParams]);

  const handleSignOut = async () => {
    setMobileOpen(false);
    await logout();
    navigate("/?auth=signin");
  };

  const getDashboardPath = () => {
    if (!user) return "/?auth=signin";
    if (user.role === "employer") return "/employer/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/student/dashboard";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    const kw = navKeyword.trim();
    const loc = navLocation.trim();
    if (kw) {
      params.set("keyword", kw);
    } else {
      params.delete("keyword");
    }
    if (loc) {
      params.set("location", loc);
    } else {
      params.delete("location");
    }
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="content-wrap h-20 flex items-center justify-between gap-4 px-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          to={user ? getDashboardPath() : "/jobs"}
          className="flex items-center gap-2.5 font-bold text-xl text-gray-800 hover:opacity-90 transition-opacity shrink-0"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200">
            <Briefcase size={18} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold tracking-tight text-gray-900 flex items-center gap-0.5">
              ITI<span className="text-blue-600">Careers</span>
            </span>
          </div>
        </Link>

        {/* Global Search Bar (Naukri style) */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex h-[46px] items-center flex-1 max-w-2xl mx-8 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow p-1">
          <div className="flex-1 flex items-center px-4 h-full border-r border-gray-200">
            <Search size={18} className="text-gray-400 mr-2 shrink-0" />
            <input 
              type="text" 
              value={navKeyword}
              onChange={(e) => setNavKeyword(e.target.value)}
              placeholder="Enter skills / designations" 
              className="w-full h-full text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
            />
          </div>
          <div className="w-1/3 flex items-center px-4 h-full">
            <MapPin size={18} className="text-gray-400 mr-2 shrink-0" />
            <input 
              type="text" 
              value={navLocation}
              onChange={(e) => setNavLocation(e.target.value)}
              placeholder="Location" 
              className="w-full h-full text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
            />
          </div>
          <button type="submit" className="h-full bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-full text-sm font-semibold transition-colors shrink-0 cursor-pointer">
            Search
          </button>
        </form>

        {/* Right Nav */}
        <div className="flex items-center gap-4 shrink-0">
          
          {/* For Employers Link (when signed out or when not employer) */}
          {!user && (
            <>
              <Link to="/?auth=signin&role=employer" className="hidden md:block text-sm font-medium text-gray-700 hover:text-blue-600 py-2">
                Employer Login
              </Link>
              <div className="w-px h-6 bg-gray-300 hidden md:block"></div>
            </>
          )}

          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <UserAccountMenu />
              <motion.button
                type="button"
                onClick={handleSignOut}
                whileHover={{ y: -1, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors shadow-xs cursor-pointer"
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/?auth=signin"
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/?auth=register"
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 px-5 rounded-full transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(prev => !prev)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t border-gray-200 bg-white overflow-hidden shadow-lg"
          >
            <div className="px-4 py-4 space-y-4">
              <form onSubmit={(e) => { setMobileOpen(false); handleSearchSubmit(e); }} className="flex flex-col gap-2">
                <input type="text" value={navKeyword} onChange={(e) => setNavKeyword(e.target.value)} placeholder="Enter skills / designations" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
                <input type="text" value={navLocation} onChange={(e) => setNavLocation(e.target.value)} placeholder="Location" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
                <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold cursor-pointer">Search</button>
              </form>

              {user ? (
                <div className="border-t border-gray-100 pt-3 flex flex-col gap-3">
                  {/* User Profile Card */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm select-none shrink-0 tracking-wider">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email || `${user.role} account`}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Core 4 Navigation Links */}
                  <div className="flex flex-col gap-1 text-sm font-medium">
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <User size={16} className="text-blue-600" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-indigo-600" />
                      <span>My Dashboard</span>
                    </Link>

                    <Link
                      to="/jobs"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Search size={16} className="text-amber-600" />
                      <span>Find Opportunities</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Globe size={16} className="text-slate-700" />
                      <span>Job Portal</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 border border-red-200 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors mt-1 cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Exit</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">For Employers</p>
                    <Link to="/?auth=signin&role=employer" onClick={() => setMobileOpen(false)} className="block py-1 text-sm text-gray-700 hover:text-blue-600">
                      Employer Login
                    </Link>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Link to="/?auth=signin" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm font-semibold rounded-lg border border-blue-600 text-blue-600">
                      Login
                    </Link>
                    <Link to="/?auth=register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-orange-500 text-white">
                      Register
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
