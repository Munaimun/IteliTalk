import {
  AlertCircle,
  ArrowLeft,
  Building,
  Edit3,
  Hash,
  KeyRound,
  Mail,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  "CSE",
  "EEE",
  "BBA",
  "MECHANICAL",
  "BANGLA",
  "ENGLISH",
  "NAVAL",
  "LAW",
  "CIVIL",
];

const StudentProfile = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    dept: "",
  });
  const [ui, setUi] = useState({
    isLoading: true,
    isSaving: false,
    errors: {},
    serverError: null,
  });

  const studentUser = JSON.parse(localStorage.getItem("studentUser") || "{}");
  const userId = studentUser._id || studentUser.id;

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchProfile = async () => {
    setUi((prev) => ({ ...prev, isLoading: true, serverError: null }));
    try {
      const response = await axiosApiInstance.get(`/api/v1/student/${userId}`);
      if (response.data.success && response.data.user) {
        const data = response.data.user;
        setProfile(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          studentId: data.studentId || "",
          dept: data.dept || "",
        });
      } else {
        setUi((prev) => ({ ...prev, serverError: "Failed to load profile" }));
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load profile. Please try again.";
      setUi((prev) => ({ ...prev, serverError: message }));
      toast.error(message);
    } finally {
      setUi((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return "Email is required";
        if (!emailRegex.test(value)) return "Please enter a valid email";
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

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (ui.errors[name]) {
      setUi((prev) => ({ ...prev, errors: { ...prev.errors, [name]: "" }, serverError: null }));
    }
  };

  const handleBlur = (name) => {
    const error = validateField(name, formData[name]);
    setUi((prev) => ({ ...prev, errors: { ...prev.errors, [name]: error } }));
  };

  const handleCancelEdit = () => {
    // Reset form data to current profile
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      studentId: profile?.studentId || "",
      dept: profile?.dept || "",
    });
    setUi((prev) => ({ ...prev, errors: {}, serverError: null }));
    setMode("view");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setUi((prev) => ({ ...prev, errors }));
      toast.error("Please fix the errors before saving");
      return;
    }

    setUi((prev) => ({ ...prev, isSaving: true, serverError: null }));

    try {
      const role = profile?.role || "Student";
      const payload = { ...formData, role };
      const response = await axiosApiInstance.put(
        `/api/v1/student/${userId}`,
        payload
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        // Refresh profile
        const updated = response.data.user || { ...profile, ...formData };
        setProfile(updated);
        // Sync localStorage
        const stored = JSON.parse(localStorage.getItem("studentUser") || "{}");
        localStorage.setItem(
          "studentUser",
          JSON.stringify({ ...stored, name: formData.name, email: formData.email })
        );
        setMode("view");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update profile. Please try again.";
      setUi((prev) => ({ ...prev, serverError: message }));
      toast.error(message);
    } finally {
      setUi((prev) => ({ ...prev, isSaving: false }));
    }
  };

  if (ui.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-8 px-4 flex items-start justify-center">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-12 w-48 mx-auto bg-[#1c1c27]" />
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-8 px-4 sm:px-6 lg:px-8 flex items-start justify-center">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1c1c27]/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-[#2c2c3a]">
            <User className="h-4 w-4 text-[#a78bfa]" />
            <span className="text-sm font-medium text-[#f1f0ff]">Student Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#f1f0ff] to-[#a78bfa] bg-clip-text text-transparent mb-2">
            {mode === "edit" ? "Edit Profile" : "My Profile"}
          </h1>
          <p className="text-[#64748b] text-sm">
            {mode === "edit"
              ? "Update your personal information"
              : "View and manage your account information"}
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-[#2c2c3a] bg-[#12121a]/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student")}
                className="flex items-center gap-2 text-[#a78bfa] hover:text-[#f1f0ff] hover:bg-[#1c1c27]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Chat
              </Button>

              <div className="flex items-center gap-2">
                {mode === "view" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode("edit")}
                    className="flex items-center gap-2 border-[#2c2c3a] bg-transparent text-[#a78bfa] hover:bg-[#1c1c27] hover:text-[#f1f0ff]"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#f1f0ff] hover:bg-[#1c1c27]"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-2">
            {/* Server Error */}
            {ui.serverError && (
              <Alert className="mb-6 bg-red-900/20 border-red-700/50 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{ui.serverError}</AlertDescription>
              </Alert>
            )}

            {/* Avatar Placeholder */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-[#2c2c3a] flex items-center justify-center shadow-lg mb-3">
                <span className="text-3xl font-bold text-[#f1f0ff]">
                  {(profile?.name || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-[#1c1c27] text-[#a78bfa] border-[#2c2c3a] flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                Student
              </Badge>
            </div>

            <Separator className="bg-[#2c2c3a] mb-6" />

            {mode === "view" ? (
              /* ─── View Mode ─── */
              <div className="space-y-4">
                {[
                  { icon: User, label: "Full Name", value: profile?.name },
                  { icon: Mail, label: "Email Address", value: profile?.email },
                  { icon: Hash, label: "Student ID", value: profile?.studentId },
                  { icon: Building, label: "Department", value: profile?.dept },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#1c1c27] border border-[#2c2c3a]"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#2c2c3a] flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-[#a78bfa]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#64748b] text-xs mb-0.5">{label}</p>
                      <p className="text-[#f1f0ff] text-sm font-medium truncate">
                        {value || "—"}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator className="bg-[#2c2c3a] my-2" />

                {/* Change Password Link */}
                <Link to="/change-password">
                  <Button
                    variant="outline"
                    className="w-full h-11 border-[#2c2c3a] bg-transparent text-[#a78bfa] hover:bg-[#1c1c27] hover:text-[#f1f0ff] flex items-center gap-2"
                  >
                    <KeyRound className="h-4 w-4" />
                    Change Password
                  </Button>
                </Link>
              </div>
            ) : (
              /* ─── Edit Mode ─── */
              <form onSubmit={handleSave} className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-name"
                    className="text-sm font-medium text-[#a78bfa]"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="profile-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="Your full name"
                    className={`h-11 bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] focus:border-[#a78bfa] focus:ring-[#a78bfa]/20 ${
                      ui.errors.name ? "border-red-500" : ""
                    }`}
                  />
                  {ui.errors.name && (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      {ui.errors.name}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-email"
                    className="text-sm font-medium text-[#a78bfa]"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="your@email.com"
                    className={`h-11 bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] focus:border-[#a78bfa] focus:ring-[#a78bfa]/20 ${
                      ui.errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {ui.errors.email && (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      {ui.errors.email}
                    </div>
                  )}
                </div>

                {/* Student ID */}
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-student-id"
                    className="text-sm font-medium text-[#a78bfa]"
                  >
                    Student ID *
                  </Label>
                  <Input
                    id="profile-student-id"
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange("studentId", e.target.value)}
                    onBlur={() => handleBlur("studentId")}
                    placeholder="Your student ID"
                    className={`h-11 bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] focus:border-[#a78bfa] focus:ring-[#a78bfa]/20 ${
                      ui.errors.studentId ? "border-red-500" : ""
                    }`}
                  />
                  {ui.errors.studentId && (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      {ui.errors.studentId}
                    </div>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label
                    htmlFor="profile-dept"
                    className="text-sm font-medium text-[#a78bfa]"
                  >
                    Department *
                  </Label>
                  <select
                    id="profile-dept"
                    value={formData.dept}
                    onChange={(e) => handleInputChange("dept", e.target.value)}
                    onBlur={() => handleBlur("dept")}
                    className={`w-full h-11 rounded-md px-3 text-sm bg-[#1c1c27] border text-[#f1f0ff] focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/20 focus:border-[#a78bfa] transition-colors ${
                      ui.errors.dept ? "border-red-500" : "border-[#2c2c3a]"
                    }`}
                  >
                    <option value="" disabled className="text-[#64748b]">
                      Select department
                    </option>
                    {DEPARTMENTS.map((dept) => (
                      <option
                        key={dept}
                        value={dept}
                        className="bg-[#1c1c27] text-[#f1f0ff]"
                      >
                        {dept}
                      </option>
                    ))}
                  </select>
                  {ui.errors.dept && (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      {ui.errors.dept}
                    </div>
                  )}
                </div>

                <Separator className="bg-[#2c2c3a]" />

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    disabled={ui.isSaving}
                    className="flex-1 h-11 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-[#f1f0ff] font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-60"
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
                    onClick={handleCancelEdit}
                    className="h-11 px-6 border-[#2c2c3a] bg-transparent text-[#64748b] hover:bg-[#1c1c27] hover:text-[#f1f0ff]"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;
