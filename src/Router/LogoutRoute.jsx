import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

const LogoutRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLogedIn") !== null;
  const isAdmin = localStorage.getItem("adminUser") !== null;
  const isStudent = localStorage.getItem("studentUser") !== null;
  const isTeacher = localStorage.getItem("teacherUser") !== null;

  // If the user is not logged in, redirect to /login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in, redirect based on their role
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  } else if (isStudent) {
    return <Navigate to="/student" replace />;
  } else if (isTeacher) {
    return <Navigate to="/teacher" replace />;
  }

  // If none of the above conditions are met, allow the route
  return children;
};

// Define prop types for the component
LogoutRoute.propTypes = {
  children: PropTypes.node,
};

export default LogoutRoute;
