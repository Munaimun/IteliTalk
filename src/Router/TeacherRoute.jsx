import { Navigate, useLocation } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const TeacherRoute = ({ children }) => {
  const isLoggedIn = window.localStorage.getItem("isLogedIn");
  const isTeacher = window.localStorage.getItem("teacherUser") !== null;
  const isStudent = window.localStorage.getItem("studentUser") !== null;
  const isAdmin = window.localStorage.getItem("adminUser") !== null;
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (isTeacher) {
    return children;
  }

  if (isStudent) {
    return <Navigate to="/student" state={{ from: location }} />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" state={{ from: location }} />;
  }

  return <Navigate to="/login" state={{ from: location }} />;
};

export default TeacherRoute;
