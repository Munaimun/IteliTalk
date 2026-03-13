import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Shield,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosApiInstance from "../interceptor";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [ui, setUi] = useState({
    isLoading: false,
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    errors: {},
    serverError: null,
  });

  const passwordRules = {
    length: formData.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(formData.newPassword),
    lowercase: /[a-z]/.test(formData.newPassword),
    number: /\d/.test(formData.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
  };

  const passwordStrength = Object.values(passwordRules).filter(Boolean).length;
  const passwordStrengthPercentage = (passwordStrength / 5) * 100;

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return { text: "Very Weak", color: "text-red-500" };
    if (passwordStrength <= 2) return { text: "Weak", color: "text-red-400" };
    if (passwordStrength <= 3) return { text: "Fair", color: "text-yellow-500" };
    if (passwordStrength <= 4) return { text: "Good", color: "text-blue-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  const validateField = (name, value) => {
    switch (name) {
      case "password":
        if (!value) return "Current password is required";
        return "";
      case "newPassword":
        if (!value) return "New password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (value === formData.password) return "New password must be different from current password";
        return "";
      case "confirmNewPassword":
        if (!value) return "Please confirm your new password";
        if (value !== formData.newPassword) return "Passwords do not match";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setUi((prev) => ({ ...prev, errors }));
      toast.error("Please fix the errors before submitting");
      return;
    }

    setUi((prev) => ({ ...prev, isLoading: true, serverError: null }));

    try {
      const response = await axiosApiInstance.post("/api/v1/change-password", {
        password: formData.password,
        newPassword: formData.newPassword,
      });

      if (response.data.success) {
        toast.success("Password changed successfully!");
        setFormData({ password: "", newPassword: "", confirmNewPassword: "" });
        navigate(-1);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to change password. Please try again.";
      setUi((prev) => ({ ...prev, serverError: message }));
      toast.error(message);
    } finally {
      setUi((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const { text: strengthText, color: strengthColor } = getPasswordStrengthText();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-8 px-4 sm:px-6 lg:px-8 flex items-start justify-center">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1c1c27]/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-[#2c2c3a]">
            <Shield className="h-4 w-4 text-[#a78bfa]" />
            <span className="text-sm font-medium text-[#f1f0ff]">Account Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#f1f0ff] to-[#a78bfa] bg-clip-text text-transparent mb-2">
            Change Password
          </h1>
          <p className="text-[#64748b] text-sm max-w-sm mx-auto">
            Update your account password to keep your account secure
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-[#2c2c3a] bg-[#12121a]/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="w-fit flex items-center gap-2 text-[#a78bfa] hover:text-[#f1f0ff] hover:bg-[#1c1c27]"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-2">
            {/* Server Error */}
            {ui.serverError && (
              <Alert
                variant="destructive"
                className="mb-6 bg-red-900/20 border-red-800/50 text-red-400"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{ui.serverError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1c1c27] border border-[#2c2c3a] flex items-center justify-center">
                    <Lock className="h-4 w-4 text-[#a78bfa]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#f1f0ff]">
                    Current Password
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="current-password"
                    className="text-sm font-medium text-[#a78bfa]"
                  >
                    Current Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={ui.showCurrentPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      placeholder="Enter your current password"
                      className={`h-11 pr-12 bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] focus:border-[#a78bfa] focus:ring-[#a78bfa]/20 transition-all duration-200 ${
                        ui.errors.password ? "border-red-500 focus:border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent text-[#64748b] hover:text-[#a78bfa]"
                      onClick={() =>
                        setUi((prev) => ({
                          ...prev,
                          showCurrentPassword: !prev.showCurrentPassword,
                        }))
                      }
                    >
                      {ui.showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {ui.errors.password && (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      {ui.errors.password}
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-[#2c2c3a]" />

              {/* New Password Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1c1c27] border border-[#2c2c3a] flex items-center justify-center">
                    <Shield className="h-4 w-4 text-[#a78bfa]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#f1f0ff]">
                    New Password
                  </h3>
                </div>

                {/* New Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="new-password"
                    className="text-sm font-medium text-[#a78bfa]"
                  >
                    New Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={ui.showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      onBlur={() => handleBlur("newPassword")}
                      placeholder="Create a strong new password"
                      className={`h-11 pr-12 bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] focus:border-[#a78bfa] focus:ring-[#a78bfa]/20 transition-all duration-200 ${
                        ui.errors.newPassword ? "border-red-500 focus:border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent text-[#64748b] hover:text-[#a78bfa]"
                      onClick={() =>
                        setUi((prev) => ({
                          ...prev,
                          showNewPassword: !prev.showNewPassword,
                        }))
                      }
                    >
                      {ui.showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {ui.errors.newPassword && (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      {ui.errors.newPassword}
                    </div>
                  )}

                  {/* Password Strength */}
                  {formData.newPassword && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#64748b]">Password Strength</span>
                        <span className={`font-medium ${strengthColor}`}>
                          {strengthText}
                        </span>
                      </div>
                      <Progress
                        value={passwordStrengthPercentage}
                        className="h-1.5 bg-[#2c2c3a]"
                      />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs pt-1">
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
                              met ? "text-green-400" : "text-[#64748b]"
                            }`}
                          >
                            {met ? (
                              <CheckCircle className="h-3 w-3 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-3 w-3 flex-shrink-0" />
                            )}
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-new-password"
                    className="text-sm font-medium text-[#a78bfa]"
                  >
                    Confirm New Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-new-password"
                      type={ui.showConfirmPassword ? "text" : "password"}
                      value={formData.confirmNewPassword}
                      onChange={(e) =>
                        handleInputChange("confirmNewPassword", e.target.value)
                      }
                      onBlur={() => handleBlur("confirmNewPassword")}
                      placeholder="Confirm your new password"
                      className={`h-11 pr-12 bg-[#1c1c27] border-[#2c2c3a] text-[#f1f0ff] placeholder:text-[#64748b] focus:border-[#a78bfa] focus:ring-[#a78bfa]/20 transition-all duration-200 ${
                        ui.errors.confirmNewPassword
                          ? "border-red-500 focus:border-red-500"
                          : formData.confirmNewPassword &&
                            formData.confirmNewPassword === formData.newPassword
                          ? "border-green-500"
                          : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent text-[#64748b] hover:text-[#a78bfa]"
                      onClick={() =>
                        setUi((prev) => ({
                          ...prev,
                          showConfirmPassword: !prev.showConfirmPassword,
                        }))
                      }
                    >
                      {ui.showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {ui.errors.confirmNewPassword ? (
                    <div className="flex items-center gap-1 text-red-400 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      {ui.errors.confirmNewPassword}
                    </div>
                  ) : formData.confirmNewPassword &&
                    formData.confirmNewPassword === formData.newPassword ? (
                    <div className="flex items-center gap-1 text-green-400 text-xs">
                      <CheckCircle className="h-3 w-3" />
                      Passwords match
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={ui.isLoading}
                className="w-full h-11 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-[#f1f0ff] font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {ui.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Changing Password...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Change Password
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

export default ChangePassword;
