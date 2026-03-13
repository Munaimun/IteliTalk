import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axiosApiInstance from "../interceptor";

const API_URL = "/api/v1";

const LoginPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const loginUser = async (e) => {
    e.preventDefault();
    const { email, password } = data;

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axiosApiInstance.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("isLogedIn", true);
      localStorage.removeItem("studentUser");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("teacherUser");

      if (user.role === "Student") {
        localStorage.setItem("studentUser", JSON.stringify(user));
        navigate("/student");
        toast("Student Dashboard");
      } else if (user.role === "Admin") {
        localStorage.setItem("adminUser", JSON.stringify(user));
        navigate("/admin");
        toast("Admin Dashboard");
      } else if (user.role === "Teacher") {
        localStorage.setItem("teacherUser", JSON.stringify(user));
        navigate("/teacher");
        toast("Teacher Dashboard");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error("Email not found in our records. Please try again.");
      } else {
        toast.error("Login failed. Server error!!!.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 bg-[#0a0a0f]">
      <form
        onSubmit={loginUser}
        className="w-full max-w-sm sm:max-w-md bg-[#12121a] px-6 py-8 sm:px-8 sm:py-10 
        rounded-2xl shadow-[0_4px_6px_rgba(71,85,105,0.6)] border border-[#2c2c3a]"
      >
        {/* Logo & Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-slate-700 to-slate-800 
          rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-black/40">
            <span className="text-white font-bold text-lg sm:text-xl">I</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#f1f0ff]">
            Welcome back
          </h2>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">
            Sign in to your account
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#f1f0ff] sm:text-base">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              required
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder-slate-500 
              focus:border-slate-400 focus:ring-slate-400 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[#f1f0ff] sm:text-base">
              Password
            </label>
            <Input
              type="password"
              placeholder="Enter your password"
              required
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder-slate-500 
              focus:border-slate-400 focus:ring-slate-400 text-sm sm:text-base"
            />
          </div>

          {/* Button */}
          <div className="pt-2 sm:pt-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-slate-700 to-slate-800 
              hover:from-slate-600 hover:to-slate-700 text-white py-2.5 sm:py-3 rounded-xl 
              font-medium transition-all duration-200 text-sm sm:text-base"
            >
              Sign In
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
