import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useUserProfile } from "../lib/useUserProfile";
import { UserAccountMenu } from "./ui/UserAccountMenu";
import AuthModal from "./AuthModal";
import {
  User,
  LayoutDashboard,
  Search,
  Globe,
  LogOut,
} from "lucide-react";

export default function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { displayName, initials } = useUserProfile();
  const navigate = useNavigate();

  const openSignIn = () => {
    setSearchParams(params => {
      params.set("auth", "signin");
      return params;
    });
  };

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false);
    await logout();
    navigate("/?auth=signin");
  };

  const getDashboardPath = () => {
    if (!user) return "/?auth=signin";
    if (user.role === "employer") return "/employer/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/student/dashboard";
  };

  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, elementPosition - topOffset),
        behavior: "smooth"
      });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5EAF2] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold text-[#172033] flex items-center gap-2 group transition-opacity hover:opacity-90">
            ITI<span className="text-[#2563EB]">Careers</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-[#667085] font-medium text-sm">
            <Link to="/" className="relative text-[#2563EB] font-semibold transition-colors py-1 group">
              Home
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2563EB] rounded-full" />
            </Link>
            <a href="#about" onClick={(e) => scrollToAnchor(e, "about")} className="relative hover:text-[#172033] transition-colors py-1 group">
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2563EB] rounded-full transition-all duration-200 group-hover:w-full" />
            </a>
            <a href="#contact" onClick={(e) => scrollToAnchor(e, "contact")} className="relative hover:text-[#172033] transition-colors py-1 group">
              Contact Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2563EB] rounded-full transition-all duration-200 group-hover:w-full" />
            </a>
          </div>

          {/* Desktop Right Area: Strict order [ Profile ] [ Logout ] */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
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
              </>
            ) : (
              <motion.button 
                onClick={openSignIn}
                whileHover={{ y: -1, scale: 1.015 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm hover:shadow-md cursor-pointer"
              >
                Sign In
              </motion.button>
            )}
          </div>

          <div className="md:hidden">
            <motion.button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              className="text-[#172033] p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden bg-white border-b border-[#E5EAF2] px-6 py-4 flex flex-col gap-4 shadow-lg overflow-hidden"
            >
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-[#2563EB] font-medium block transition-colors">Home</Link>
              <a href="#about" onClick={(e) => scrollToAnchor(e, "about")} className="text-[#667085] hover:text-[#172033] font-medium block transition-colors">About Us</a>
              <a href="#contact" onClick={(e) => scrollToAnchor(e, "contact")} className="text-[#667085] hover:text-[#172033] font-medium block transition-colors">Contact Us</a>
              
              {user ? (
                <div className="border-t border-[#E5EAF2] pt-4 flex flex-col gap-3">
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

                  {/* Mobile Nav Links: Profile, Dashboard, Find Opportunities, Job Portal, Exit */}
                  <div className="flex flex-col gap-1 text-sm font-medium">
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <User size={16} className="text-blue-600" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-indigo-600" />
                      <span>My Dashboard</span>
                    </Link>

                    <Link
                      to="/jobs"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Search size={16} className="text-amber-600" />
                      <span>Find Opportunities</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Globe size={16} className="text-slate-700" />
                      <span>Job Portal</span>
                    </Link>
                  </div>

                  <button 
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 border border-red-200 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors mt-2 cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Exit</span>
                  </button>
                </div>
              ) : (
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    openSignIn();
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-xl font-medium transition-colors w-full text-center mt-2 shadow-sm cursor-pointer"
                >
                  Sign In
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal />
    </>
  );
}
