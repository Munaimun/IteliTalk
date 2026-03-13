import { LogOut, Menu, Settings, User, X } from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import axiosApiInstance from "../interceptor";

const Navbar = ({
  isAuthenticated: propIsAuthenticated,
  setIsAuthenticated: setPropIsAuthenticated,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logedIn =
    typeof window !== "undefined" ? localStorage.getItem("isLogedIn") : null;

  const handleLogout = async () => {
    try {
      const response = await axiosApiInstance.post("/api/v1/logout");
      if (response.status === 200) {
        localStorage.clear();
        if (typeof setPropIsAuthenticated === "function")
          setPropIsAuthenticated(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const getUserName = () => {
    const studentUser = JSON.parse(localStorage.getItem("studentUser") || "{}");
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const teacherUser = JSON.parse(localStorage.getItem("teacherUser") || "{}");
    return studentUser.name || adminUser.name || teacherUser.name || "User";
  };

  const getUserEmail = () => {
    const studentUser = JSON.parse(localStorage.getItem("studentUser") || "{}");
    const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
    const teacherUser = JSON.parse(localStorage.getItem("teacherUser") || "{}");
    return studentUser.email || adminUser.email || teacherUser.email || "";
  };

  const isTeacher = localStorage.getItem("teacherUser") !== null;

  const isOnGuestPage = location.pathname === "/chat";
  const effectiveIsAuthenticated =
    typeof propIsAuthenticated === "boolean"
      ? propIsAuthenticated
      : logedIn === "true";

  return (
    <nav className="sticky top-0 z-50 w-full">
      <div className="container w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={
            "flex justify-between items-center h-16 rounded-xl p-3 -mx-4 md:mx-0 mt-3 " +
            "bg-white/5 dark:bg-zinc-900/40 backdrop-blur-md backdrop-saturate-150 shadow-sm dark:border-zinc-800/40"
          }
        >
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="text-xl font-bold text-[#f1f0ff]">InteliTalk</span>
          </Link>

          {/* Desktop Section */}
          <div className="hidden md:flex items-center space-x-4">
            {effectiveIsAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full hover:bg-[#1c1c27] shadow"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={getUserName()} />
                      <AvatarFallback className="bg-[#2c2c3a] text-[#f1f0ff]">
                        {getUserName().charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-[#1c1c27] text-[#f1f0ff] border-[#2c2c3a]"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getUserName()}
                      </p>
                      <p className="text-xs text-[#a78bfa]">{getUserEmail()}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#2c2c3a]" />
                  {!isTeacher && (
                    <DropdownMenuItem asChild className="hover:bg-[#2c2c3a] cursor-pointer">
                      <Link to="/profile" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4 text-[#a78bfa]" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="hover:bg-[#2c2c3a] cursor-pointer">
                    <Link to="/change-password" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4 text-[#a78bfa]" />
                      <span>Change Password</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#2c2c3a]" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="hover:bg-[#2c2c3a]"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-rose-400" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  asChild
                  className="text-white hover:text-white bg-slate-600 rounded-xl hover:bg-[#1c1c27] hover:rounded-xl shadow"
                >
                  <Link to="/login">Sign In</Link>
                </Button>

                <Button
                  asChild
                  className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-500 hover:to-slate-600 text-white rounded-xl shadow"
                >
                  <Link to={isOnGuestPage ? "/chat" : "/chat"}>Guest</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#c7bdf5] hover:text-white shadow"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden mt-2 rounded-xl p-3
      bg-white/5 dark:bg-zinc-900/40 
      backdrop-blur-md backdrop-saturate-150
      border border-white/10 dark:border-zinc-800/40 
      shadow space-y-2"
          >
            {effectiveIsAuthenticated ? (
              <>
                {!isTeacher && (
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 
          text-[#e9e7ff] rounded-lg 
          bg-white/5 hover:bg-[#1c1c27] 
          transition shadow"
                  >
                    <User className="h-4 w-4 text-[#a78bfa]" />
                    <span>Profile</span>
                  </Link>
                )}

                <Link
                  to="/change-password"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-4 py-2 
          text-[#e9e7ff] rounded-lg 
          bg-white/5 hover:bg-[#1c1c27] 
          transition shadow"
                >
                  <Settings className="h-4 w-4 text-[#a78bfa]" />
                  <span>Change Password</span>
                </Link>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 
          text-[#e9e7ff] rounded-lg 
          bg-white/5 hover:bg-[#1c1c27] 
          transition shadow"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 
          text-[#e9e7ff] rounded-lg 
          bg-white/5 hover:bg-[#1c1c27] 
          transition shadow"
                >
                  <User className="h-4 w-4 text-[#a78bfa]" />
                  Sign In
                </Link>

                <Link
                  to="/chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 
          rounded-lg text-white 
          bg-gradient-to-r from-slate-700 to-slate-800 
          hover:from-slate-500 hover:to-slate-600 
          transition shadow"
                >
                  <Menu className="h-4 w-4" />
                  Guest
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  isAuthenticated: PropTypes.bool,
  setIsAuthenticated: PropTypes.func,
};

export default Navbar;
