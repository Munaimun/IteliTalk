import { Navigate, useLocation } from "react-router-dom";

// Allows any authenticated user (student or admin) — no role restriction
// eslint-disable-next-line react/prop-types
const AuthRoute = ({ children }) => {
  const isLoggedIn = window.localStorage.getItem("isLogedIn");
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
};

export default AuthRoute;
