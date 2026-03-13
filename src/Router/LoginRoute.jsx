import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import LoginPage from "../Components/LoginPage";

const LoginRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLogedIn") !== null;
  const isAdmin = localStorage.getItem("adminUser") !== null;
  const isStudent = localStorage.getItem("studentUser") !== null;
  const isTeacher = localStorage.getItem("teacherUser") !== null;

  // If the user is logged in, redirect them based on their role
  if (isLoggedIn) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    } else if (isStudent) {
      return <Navigate to="/student" replace />;
    } else if (isTeacher) {
      return <Navigate to="/teacher" replace />;
    }
  }

  // If the user is not logged in, allow them to proceed to the login page
  return children || <LoginPage />;
};

// Define prop types for the component
LoginRoute.propTypes = {
  children: PropTypes.node,
};

export default LoginRoute;
