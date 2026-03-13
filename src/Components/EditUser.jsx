import {
  AlertCircle,
  ArrowLeft,
  Building,
  GraduationCap,
  Hash,
  Mail,
  Save,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosApiInstance from "../interceptor";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

const DEPARTMENTS = [
  "CSE", "EEE", "BBA", "MECHANICAL",
  "BANGLA", "ENGLISH", "NAVAL", "LAW", "CIVIL",
];

const API_URL = "/api/v1/admin";

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState({
    name: "",
    email: "",
    dept: "",
    studentId: "",
    role: "Student",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [ui, setUi] = useState({
    isSaving: false,
    errors: {},
    serverError: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosApiInstance.get(`${API_URL}/user/${id}`);
        if (response.data.success && response.data.user) {
          setUser((prev) => ({ ...prev, ...response.data.user }));
        } else {
          toast.error("User not found");
          navigate("/admin");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error fetching user data");
        navigate("/admin");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value?.trim()) return "Name is required";
        return "";
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Enter a valid email";
        return "";
      case "studentId":
        if (user.role === "Student" && !value?.trim())
          return "Student ID is required";
        return "";
      case "dept":
        if (!value) return "Department is required";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (name, value) => {
    setUser((prev) => ({ ...prev, [name]: value }));
    if (ui.errors[name]) {
      setUi((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
        serverError: null,
      }));
    }
  };

  const handleBlur = (name) => {
    const error = validateField(name, user[name]);
    setUi((prev) => ({ ...prev, errors: { ...prev.errors, [name]: error } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fields = ["name", "email", "dept"];
    if (user.role === "Student") fields.push("studentId");
    const errors = {};
    fields.forEach((k) => {
      const err = validateField(k, user[k]);
      if (err) errors[k] = err;
    });
    if (Object.keys(errors).length > 0) {
      setUi((prev) => ({ ...prev, errors }));
      toast.error("Please fix the errors before saving");
      return;
    }

    setUi((prev) => ({ ...prev, isSaving: true, serverError: null }));
    try {
      const response = await axiosApiInstance.put(`${API_URL}/user/${id}`, user);
      if (response.data.success) {
        toast.success("User updated successfully!");
        navigate(`/user/${id}`);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update user";
      setUi((prev) => ({ ...prev, serverError: message }));
      toast.error(message);
    } finally {
      setUi((prev) => ({ ...prev, isSaving: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-8 px-4 flex items-start justify-center">
        <div className="w-full max-w-lg">
          <Card className="border-[#2c2c3a] bg-[#12121a]">
            <CardContent className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-[#1c1c27]" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-8 px-4 sm:px-6 flex items-start justify-center">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1c1c27]/80 rounded-full px-4 py-2 mb-4 border border-[#2c2c3a]">
            <User className="h-4 w-4 text-[#a78bfa]" />
            <span className="text-sm font-medium text-[#f1f0ff]">
              Admin — Edit User
            </span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#f1f0ff] to-[#a78bfa] bg-clip-text text-transparent">
            Edit {user.name || "User"}
          </h1>
        </div>

        <Card className="border-[#2c2c3a] bg-[#12121a]/95 shadow-2xl">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/user/${id}`)}
                className="flex items-center gap-2 text-[#a78bfa] hover:text-[#f1f0ff] hover:bg-[#1c1c27]"
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Button>
              <Badge
                variant="outline"
                className={
                  user.role === "Admin"
                    ? "bg-purple-900/30 text-purple-300 border-purple-700/50"
                    : "bg-blue-900/30 text-blue-300 border-blue-700/50"
                }
              >
                {user.role === "Admin" ? (
                  <Shield className="h-3 w-3 mr-1" />
                ) : (
                  <GraduationCap className="h-3 w-3 mr-1" />
                )}
                {user.role || "Student"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-2">
            {ui.serverError && (
              <Alert className="mb-5 bg-red-900/20 border-red-700/50 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{ui.serverError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-name"
                  className="text-xs font-medium text-[#a78bfa]"
                >
                  Full Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
                  <Input
                    id="edit-name"
                    type="text"
                    value={user.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="Full name"
                    className={`h-11 pl-9 bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] focus:border-[#a78bfa] ${
                      ui.errors.name ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {ui.errors.name && (
                  <p className="flex items-center gap-1 text-red-400 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {ui.errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-email"
                  className="text-xs font-medium text-[#a78bfa]"
                >
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
                  <Input
                    id="edit-email"
                    type="email"
                    value={user.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="Email address"
                    className={`h-11 pl-9 bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] focus:border-[#a78bfa] ${
                      ui.errors.email ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {ui.errors.email && (
                  <p className="flex items-center gap-1 text-red-400 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {ui.errors.email}
                  </p>
                )}
              </div>

              {/* Student ID (students only) */}
              {user.role === "Student" && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-studentid"
                    className="text-xs font-medium text-[#a78bfa]"
                  >
                    Student ID *
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
                    <Input
                      id="edit-studentid"
                      type="text"
                      value={user.studentId}
                      onChange={(e) =>
                        handleChange("studentId", e.target.value)
                      }
                      onBlur={() => handleBlur("studentId")}
                      placeholder="Student ID"
                      className={`h-11 pl-9 bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] focus:border-[#a78bfa] ${
                        ui.errors.studentId ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {ui.errors.studentId && (
                    <p className="flex items-center gap-1 text-red-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      {ui.errors.studentId}
                    </p>
                  )}
                </div>
              )}

              {/* Department */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-dept"
                  className="text-xs font-medium text-[#a78bfa]"
                >
                  Department *
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b] pointer-events-none z-10" />
                  <select
                    id="edit-dept"
                    value={user.dept}
                    onChange={(e) => handleChange("dept", e.target.value)}
                    onBlur={() => handleBlur("dept")}
                    className={`w-full h-11 rounded-md pl-9 pr-3 text-sm bg-[#1c1c27] border text-[#f1f0ff] focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/20 focus:border-[#a78bfa] transition-colors appearance-none ${
                      ui.errors.dept ? "border-red-500" : "border-[#2c2c3a]"
                    }`}
                  >
                    <option value="" disabled className="bg-[#1c1c27] text-[#64748b]">
                      Select department
                    </option>
                    {DEPARTMENTS.map((d) => (
                      <option
                        key={d}
                        value={d}
                        className="bg-[#1c1c27] text-[#f1f0ff]"
                      >
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                {ui.errors.dept && (
                  <p className="flex items-center gap-1 text-red-400 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {ui.errors.dept}
                  </p>
                )}
              </div>

              <Separator className="bg-[#2c2c3a]" />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={ui.isSaving}
                  className="flex-1 h-11 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-[#f1f0ff] font-semibold transition-all duration-200 disabled:opacity-60"
                >
                  {ui.isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </div>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={ui.isSaving}
                  onClick={() => navigate(`/user/${id}`)}
                  className="h-11 px-5 border-[#2c2c3a] bg-transparent text-[#64748b] hover:bg-[#1c1c27] hover:text-[#f1f0ff]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditUser;

