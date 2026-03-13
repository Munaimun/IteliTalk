import {
  AlertCircle,
  ArrowLeft,
  Building,
  GraduationCap,
  Hash,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const DEPARTMENTS = [
  "CSE", "EEE", "BBA", "MECHANICAL",
  "BANGLA", "ENGLISH", "NAVAL", "LAW", "CIVIL",
];

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    dept: "",
    role: "Student",
    password: "",
    confirmPassword: "",
  });

  const [ui, setUi] = useState({
    isLoading: false,
    errors: {},
    serverError: null,
  });

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "At least 2 characters";
        return "";
      case "email": {
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email";
        return "";
      }
      case "studentId":
        if (!value.trim()) return "Student ID is required";
        return "";
      case "dept":
        if (!value) return "Department is required";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (ui.errors[name]) {
      setUi((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
        serverError: null,
      }));
    }
  };

  const handleBlur = (name) => {
    const error = validateField(name, formData[name]);
    setUi((prev) => ({ ...prev, errors: { ...prev.errors, [name]: error } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fields = ["name", "email", "studentId", "dept"];
    const errors = {};
    fields.forEach((k) => {
      const err = validateField(k, formData[k]);
      if (err) errors[k] = err;
    });
    if (Object.keys(errors).length > 0) {
      setUi((prev) => ({ ...prev, errors }));
      toast.error("Please fix the errors before submitting");
      return;
    }

    setUi((prev) => ({ ...prev, isLoading: true, serverError: null }));
    try {
      const response = await axiosApiInstance.post("/api/v1/admin/student-signup", formData);
      if (response.data.success) {
        toast.success("Student registered successfully!");
        navigate("/admin");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      setUi((prev) => ({ ...prev, serverError: message }));
      toast.error(message);
    } finally {
      setUi((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-8 px-4 sm:px-6 lg:px-8 flex items-start justify-center">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1c1c27]/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-[#2c2c3a]">
            <UserPlus className="h-4 w-4 text-[#a78bfa]" />
            <span className="text-sm font-medium text-[#f1f0ff]">
              Admin — Register Student
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#f1f0ff] to-[#a78bfa] bg-clip-text text-transparent mb-2">
            Add New Student
          </h1>
          <p className="text-[#64748b] text-sm max-w-sm mx-auto">
            Register a student account. A default password will be assigned.
          </p>
        </div>

        <Card className="border-[#2c2c3a] bg-[#12121a]/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 text-[#a78bfa] hover:text-[#f1f0ff] hover:bg-[#1c1c27]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <Badge
                variant="outline"
                className="bg-blue-900/30 text-blue-300 border-blue-700/50 flex items-center gap-1"
              >
                <GraduationCap className="h-3 w-3" />
                Student
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1c1c27] border border-[#2c2c3a] flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-[#a78bfa]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f1f0ff]">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="s-name" className="text-xs font-medium text-[#a78bfa]">
                      Full Name *
                    </Label>
                    <Input
                      id="s-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      placeholder="Student's full name"
                      className={`h-10 bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] focus:border-[#a78bfa] ${
                        ui.errors.name ? "border-red-500" : ""
                      }`}
                    />
                    {ui.errors.name && (
                      <p className="flex items-center gap-1 text-red-400 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {ui.errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="s-email" className="text-xs font-medium text-[#a78bfa]">
                      Email Address *
                    </Label>
                    <Input
                      id="s-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="student@university.edu"
                      className={`h-10 bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] focus:border-[#a78bfa] ${
                        ui.errors.email ? "border-red-500" : ""
                      }`}
                    />
                    {ui.errors.email && (
                      <p className="flex items-center gap-1 text-red-400 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {ui.errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="bg-[#2c2c3a]" />

              {/* Academic Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1c1c27] border border-[#2c2c3a] flex items-center justify-center">
                    <Building className="h-3.5 w-3.5 text-[#a78bfa]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f1f0ff]">
                    Academic Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="s-student-id" className="text-xs font-medium text-[#a78bfa]">
                      Student ID *
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748b]" />
                      <Input
                        id="s-student-id"
                        type="text"
                        value={formData.studentId}
                        onChange={(e) => handleChange("studentId", e.target.value)}
                        onBlur={() => handleBlur("studentId")}
                        placeholder="e.g. 2021-1-60-001"
                        className={`h-10 pl-9 bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] focus:border-[#a78bfa] ${
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

                  <div className="space-y-1.5">
                    <Label htmlFor="s-dept" className="text-xs font-medium text-[#a78bfa]">
                      Department *
                    </Label>
                    <select
                      id="s-dept"
                      value={formData.dept}
                      onChange={(e) => handleChange("dept", e.target.value)}
                      onBlur={() => handleBlur("dept")}
                      className={`w-full h-10 rounded-md px-3 text-sm bg-[#1c1c27] border text-[#f1f0ff] focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/20 focus:border-[#a78bfa] transition-colors ${
                        ui.errors.dept ? "border-red-500" : "border-[#2c2c3a]"
                      }`}
                    >
                      <option value="" disabled className="bg-[#1c1c27] text-[#64748b]">
                        Select department
                      </option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d} className="bg-[#1c1c27] text-[#f1f0ff]">
                          {d}
                        </option>
                      ))}
                    </select>
                    {ui.errors.dept && (
                      <p className="flex items-center gap-1 text-red-400 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {ui.errors.dept}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[#1c1c27] border border-[#2c2c3a]">
                <Mail className="h-4 w-4 text-[#a78bfa] shrink-0 mt-0.5" />
                <p className="text-[#64748b] text-xs leading-relaxed">
                  A default password{" "}
                  <span className="text-[#a78bfa] font-mono">123456</span> will
                  be set. The student should change it after first login via{" "}
                  <span className="text-[#a78bfa]">Change Password</span>.
                </p>
              </div>

              <Button
                type="submit"
                disabled={ui.isLoading}
                className="w-full h-11 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-[#f1f0ff] font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-60"
              >
                {ui.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Register Student
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
