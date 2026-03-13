import {
  AlertCircle,
  ArrowLeft,
  Building,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Sparkles,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import axiosApiInstance from "../interceptor";

const API_URL = "/api/v1";

const AdminSignUp = () => {
  const navigate = useNavigate();

  // State variables
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Admin",
    password: "",
    confirmPassword: "",
    dept: "",
  });

  const [ui, setUi] = useState({
    isLoading: false,
    showPassword: false,
    showConfirmPassword: false,
    errors: {},
    touchedFields: {},
    currentStep: 1,
  });

  // Password validation rules
  const passwordRules = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const departments = [
    { value: "CSE", label: "Computer Science & Engineering", icon: "💻" },
    { value: "EEE", label: "Electrical & Electronic Engineering", icon: "⚡" },
    { value: "BBA", label: "Business Administration", icon: "💼" },
    { value: "MECHANICAL", label: "Mechanical Engineering", icon: "⚙️" },
    { value: "BANGLA", label: "Bengali Literature", icon: "📚" },
    { value: "ENGLISH", label: "English Literature", icon: "📖" },
    { value: "NAVAL", label: "Naval Architecture", icon: "🚢" },
    { value: "LAW", label: "Law", icon: "⚖️" },
    { value: "CIVIL", label: "Civil Engineering", icon: "🏗️" },
  ];

  // Calculate password strength
  const passwordStrength = Object.values(passwordRules).filter(Boolean).length;
  const passwordStrengthPercentage = (passwordStrength / 5) * 100;

  // Validation functions
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.trim().length < 2)
          error = "Name must be at least 2 characters";
        break;
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) error = "Email is required";
        else if (!emailRegex.test(value)) error = "Please enter a valid email";
        break;
      }
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8)
          error = "Password must be at least 8 characters";
        break;
      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== formData.password) error = "Passwords do not match";
        break;
      case "dept":
        if (!value) error = "Department is required";
        break;
    }

    return error;
  };

  // Handle input changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (ui.errors[name]) {
      setUi((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
      }));
    }
  };

  // Handle field blur
  const handleBlur = (name) => {
    const error = validateField(name, formData[name]);
    setUi((prev) => ({
      ...prev,
      touchedFields: { ...prev.touchedFields, [name]: true },
      errors: { ...prev.errors, [name]: error },
    }));
  };

  // Validate entire form
  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "role") {
        const error = validateField(key, formData[key]);
        if (error) errors[key] = error;
      }
    });
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setUi((prev) => ({ ...prev, errors, touchedFields: formData }));
      toast.error("Please fix the errors before submitting");
      return;
    }

    setUi((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await axiosApiInstance.post(
        `${API_URL}/admin/signup`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Admin registered successfully!");
        navigate("/admin");
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
      console.error("Error registering admin:", error.response);
    } finally {
      setUi((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const isFormValid =
    Object.values(passwordRules).every(Boolean) &&
    formData.confirmPassword === formData.password &&
    formData.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.dept;

  // Get password strength color
  // const getPasswordStrengthColor = () => {
  //   if (passwordStrength <= 2) return "bg-red-500";
  //   if (passwordStrength <= 3) return "bg-yellow-500";
  //   if (passwordStrength <= 4) return "bg-blue-500";
  //   return "bg-green-500";
  // };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 py-4 px-2 sm:px-4 lg:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with floating card effect */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4 shadow-lg">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Admin Registration Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create New Admin Account
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto">
            Set up administrative access with secure credentials and department
            assignment
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
          {/* Card Header */}
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>

              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
              >
                <Shield className="h-3 w-3" />
                Administrator
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      onBlur={() => handleBlur("name")}
                      placeholder="Enter administrator's full name"
                      className={`h-11 transition-all duration-200 ${
                        ui.errors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {ui.errors.name && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {ui.errors.name}
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      onBlur={() => handleBlur("email")}
                      placeholder="admin@university.edu"
                      className={`h-11 transition-all duration-200 ${
                        ui.errors.email
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {ui.errors.email && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {ui.errors.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Department Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Department Assignment
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Department *
                  </Label>
                  <Select
                    value={formData.dept}
                    onValueChange={(value) => handleInputChange("dept", value)}
                  >
                    <SelectTrigger
                      className={`h-11 transition-all duration-200 ${
                        ui.errors.dept
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    >
                      <SelectValue placeholder="Choose department to manage" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          <div className="flex items-center gap-3 py-1">
                            <span className="text-lg">{dept.icon}</span>
                            <div className="flex flex-col">
                              <span className="font-medium">{dept.value}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {dept.label}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {ui.errors.dept && (
                    <div className="flex items-center gap-1 text-red-600 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      {ui.errors.dept}
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Security Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Security Setup
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={ui.showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        onBlur={() => handleBlur("password")}
                        placeholder="Create a strong password"
                        className={`h-11 pr-12 transition-all duration-200 ${
                          ui.errors.password
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                        onClick={() =>
                          setUi((prev) => ({
                            ...prev,
                            showPassword: !prev.showPassword,
                          }))
                        }
                      >
                        {ui.showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Password Strength
                          </span>
                          <span
                            className={`font-medium ${
                              passwordStrength <= 2
                                ? "text-red-600"
                                : passwordStrength <= 3
                                ? "text-yellow-600"
                                : passwordStrength <= 4
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <Progress
                          value={passwordStrengthPercentage}
                          className="h-2"
                        />

                        {/* Password Requirements Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {Object.entries({
                            "8+ characters": passwordRules.length,
                            Uppercase: passwordRules.uppercase,
                            Lowercase: passwordRules.lowercase,
                            Number: passwordRules.number,
                            "Special char": passwordRules.special,
                          }).map(([rule, met]) => (
                            <div
                              key={rule}
                              className={`flex items-center gap-1 transition-colors ${
                                met ? "text-green-600" : "text-slate-400"
                              }`}
                            >
                              {met ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              <span>{rule}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {ui.errors.password && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {ui.errors.password}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={ui.showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        onBlur={() => handleBlur("confirmPassword")}
                        placeholder="Confirm your password"
                        className={`h-11 pr-12 transition-all duration-200 ${
                          ui.errors.confirmPassword
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : formData.confirmPassword &&
                              formData.confirmPassword === formData.password
                            ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                        onClick={() =>
                          setUi((prev) => ({
                            ...prev,
                            showConfirmPassword: !prev.showConfirmPassword,
                          }))
                        }
                      >
                        {ui.showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                    </div>

                    {formData.confirmPassword && (
                      <div
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          formData.confirmPassword === formData.password
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formData.confirmPassword === formData.password ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {formData.confirmPassword === formData.password
                          ? "Passwords match perfectly"
                          : "Passwords do not match"}
                      </div>
                    )}

                    {ui.errors.confirmPassword && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        {ui.errors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin")}
                  className="flex-1 h-12 border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || ui.isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ui.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Create Admin Account
                    </div>
                  )}
                </Button>
              </div>
            </form>

            {/* Security Notice */}
            <Alert className="mt-6 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Security Notice:</strong> This account will have full
                administrative privileges. Please ensure all credentials are
                secure and follow your organizations password policy.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSignUp;
