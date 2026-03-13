import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Define the API base URL
const API_URL = "/api/v1";

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component that manages authentication state
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initial check for authentication status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(token !== null);
  }, []);

  // Function to handle user login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      const { token, user } = response.data;

      // Store token and user data in local storage
      localStorage.setItem("token", token);
      if (user.role === "Student") {
        localStorage.setItem("studentUser", JSON.stringify(user));
        navigate("/student");
      } else if (user.role === "Admin") {
        localStorage.setItem("adminUser", JSON.stringify(user));
        navigate("/admin");
      } else if (user.role === "Teacher") {
        localStorage.setItem("teacherUser", JSON.stringify(user));
        navigate("/teacher");
      }

      // Update authentication state
      setIsAuthenticated(true);
    } catch (error) {
      console.error(error);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  // Function to handle user logout
  const logout = () => {
    // Remove user data from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("studentUser");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("teacherUser");

    // Update authentication state
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Specify PropTypes for the AuthProvider
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
