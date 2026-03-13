import { Navigate, useLocation } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ children }) => {
  const isLoggedIn = window.localStorage.getItem("isLogedIn");
  const isStudent = window.localStorage.getItem("studentUser") !== null;
  const isAdmin = window.localStorage.getItem("adminUser") !== null;
  const isTeacher = window.localStorage.getItem("teacherUser") !== null;
  const location = useLocation();

  // Check if the user is logged in and has a student role
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (isStudent) {
    return children;
  }

  if (isTeacher) {
    return <Navigate to="/teacher" state={{ from: location }} />;
  }

  // If user is an admin, redirect to the admin path
  if (isAdmin) {
    return <Navigate to="/admin" state={{ from: location }} />;
  }

  return <Navigate to="/login" state={{ from: location }} />;
};

export default PrivateRoute;
