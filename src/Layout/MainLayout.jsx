import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import "./Mainlayout.css";

const MainLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const studentUser = localStorage.getItem("studentUser");
    const adminUser = localStorage.getItem("adminUser");
    const teacherUser = localStorage.getItem("teacherUser");
    setIsAuthenticated(
      token !== null &&
        (studentUser !== null || adminUser !== null || teacherUser !== null)
    );
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F] text-[#f1f0ff] text-sm">
      <Navbar
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        isMobile={isMobile}
      />

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
