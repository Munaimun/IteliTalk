import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosApiInstance from "../interceptor";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const TeacherSignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    dept: "",
    password: "",
    confirmPassword: "",
    role: "Student",
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.studentId || !formData.dept) {
      toast.error("Name, email, student ID, and department are required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosApiInstance.post("/api/v1/teacher/student-signup", formData);
      if (response.data?.success) {
        toast.success("Student created successfully");
        navigate("/teacher");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create student");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-start justify-center py-8 px-4">
      <Card className="w-full max-w-xl bg-[#12121a] border-[#2c2c3a]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#f1f0ff]">Teacher - Register Student</CardTitle>
            <Button variant="ghost" onClick={() => navigate("/teacher")} className="text-[#a78bfa]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
            </div>
            <div>
              <Label>Student ID</Label>
              <Input value={formData.studentId} onChange={(e) => handleChange("studentId", e.target.value)} />
            </div>
            <div>
              <Label>Department</Label>
              <Input value={formData.dept} onChange={(e) => handleChange("dept", e.target.value)} />
            </div>
            <div>
              <Label>Password (optional)</Label>
              <Input type="password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} />
            </div>
            <div>
              <Label>Confirm Password (optional)</Label>
              <Input type="password" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-indigo-700 hover:bg-indigo-600">
              {isLoading ? "Creating..." : "Create Student"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherSignUp;
