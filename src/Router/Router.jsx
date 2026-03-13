import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../Layout/MainLayout";
import Intro from "../Components/Intro";
import Chat from "../Components/Chat";
import Admin from "../Components/Admin";
import StudentUi from "../Components/StudentUi";
import SignUp from "../Components/SignUp";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import TeacherRoute from "./TeacherRoute";
import AuthRoute from "./AuthRoute";
import LogoutRoute from "./LogoutRoute";
import LoginRoute from "./LoginRoute";
import UserDetail from "../Components/UserDetail";
import TeacherSignUp from "../Components/TeacherSignUp";
import EditUser from "../Components/EditUser";
import ChangePassword from "../Components/ChangePassword";
import PDFUpload from "../Components/PDFUpload";
import StudentProfile from "../Components/StudentProfile";
import TeacherDashboard from "../Components/TeacherDashboard";

// Define the router configuration
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Intro />,
      },
      {
        path: "/login",
        element: <LoginRoute />,
      },
      {
        path: "/student",
        element: (
          <PrivateRoute>
            <StudentUi />
          </PrivateRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <AdminRoute>
            <Admin />
          </AdminRoute>
        ),
      },
      {
        path: "/chat",
        element: <Chat />,
      },
      {
        path: "/signup",
        element: (
          <AdminRoute>
            <SignUp />
          </AdminRoute>
        ),
      },
      {
        path: "/signupadmin",
        element: (
          <AdminRoute>
            <TeacherSignUp />
          </AdminRoute>
        ),
      },
      {
        path: "/teacher",
        element: (
          <TeacherRoute>
            <TeacherDashboard />
          </TeacherRoute>
        ),
      },
      {
        path: "/teacher/signup",
        element: (
          <TeacherRoute>
            <TeacherSignUp />
          </TeacherRoute>
        ),
      },
      {
        path: "/user/:id",
        element: (
          <AdminRoute>
            <UserDetail />
          </AdminRoute>
        ),
      },
      {
        path: "/user/edit/:id",
        element: (
          <AdminRoute>
            <EditUser />
          </AdminRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <StudentProfile />
          </PrivateRoute>
        ),
      },
      {
        path: "/change-password",
        element: (
          <AuthRoute>
            <ChangePassword />
          </AuthRoute>
        ),
      },
      {
        path: "/admin/upload",
        element: (
          <AdminRoute>
            <PDFUpload />
          </AdminRoute>
        ),
      },
      {
        path: "/logout",
        element: <LogoutRoute />,
      },
    ],
  },
  {
    path: "*",
    element: (
      <div className="mt-60">
        <p className="text-center text-blue-950 text-7xl">
          404 route not found!!!
        </p>
      </div>
    ),
  },
]);
