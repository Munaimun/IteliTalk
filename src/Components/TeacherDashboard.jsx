import { BarChart3, Edit3, LogOut, RefreshCw, Trash2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosApiInstance from "../interceptor";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", studentId: "", dept: "" });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsRes, statsRes] = await Promise.all([
        axiosApiInstance.get("/api/v1/teacher/students"),
        axiosApiInstance.get("/api/v1/teacher/department-stats"),
      ]);

      setStudents(studentsRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load teacher dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await axiosApiInstance.delete(`/api/v1/teacher/student/${id}`);
      toast.success("Student deleted successfully");
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete student");
    }
  };

  const startEdit = (student) => {
    setEditing(student._id);
    setForm({
      name: student.name || "",
      email: student.email || "",
      studentId: student.studentId || "",
      dept: student.dept || "",
    });
  };

  const saveEdit = async (id) => {
    try {
      const response = await axiosApiInstance.put(`/api/v1/teacher/student/${id}`, {
        ...form,
        role: "Student",
      });

      const updated = response.data?.data;
      setStudents((prev) => prev.map((item) => (item._id === id ? updated : item)));
      setEditing(null);
      toast.success("Student updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update student");
    }
  };

  const handleLogout = async () => {
    try {
      await axiosApiInstance.post("/api/v1/logout");
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f0ff]">Teacher Dashboard</h1>
          <p className="text-[#94a3b8] text-sm">Manage department students and monitor statistics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/teacher/signup")} className="bg-indigo-700 hover:bg-indigo-600">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
          <Button variant="outline" onClick={loadData} className="border-[#2c2c3a] text-[#a78bfa]">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleLogout} className="border-[#2c2c3a] text-rose-400">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#12121a] border-[#2c2c3a]">
          <CardHeader>
            <CardTitle className="text-sm text-[#94a3b8]">Department</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-[#f1f0ff]">{stats?.department || "-"}</CardContent>
        </Card>
        <Card className="bg-[#12121a] border-[#2c2c3a]">
          <CardHeader>
            <CardTitle className="text-sm text-[#94a3b8]">Total Students</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-[#f1f0ff]">{stats?.totalStudents ?? students.length}</CardContent>
        </Card>
        <Card className="bg-[#12121a] border-[#2c2c3a]">
          <CardHeader>
            <CardTitle className="text-sm text-[#94a3b8]">Recent Students</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-[#f1f0ff] flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-[#a78bfa]" />
            {stats?.recentStudents?.length ?? 0}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#12121a] border-[#2c2c3a]">
        <CardHeader>
          <CardTitle className="text-[#f1f0ff]">Students</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-[#94a3b8]">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-[#94a3b8]">No students found for your department.</p>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student._id} className="rounded-lg border border-[#2c2c3a] bg-[#1c1c27] p-3">
                  {editing === student._id ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                      <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                      <Input value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))} />
                      <Input value={form.dept} onChange={(e) => setForm((p) => ({ ...p, dept: e.target.value }))} />
                      <div className="md:col-span-4 flex gap-2">
                        <Button onClick={() => saveEdit(student._id)} className="bg-emerald-700 hover:bg-emerald-600">Save</Button>
                        <Button variant="outline" onClick={() => setEditing(null)} className="border-[#2c2c3a]">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[#f1f0ff] font-medium">{student.name}</p>
                        <p className="text-[#94a3b8] text-sm">{student.email}</p>
                        <p className="text-[#94a3b8] text-xs">{student.studentId} • {student.dept}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(student)} className="border-[#2c2c3a]">
                          <Edit3 className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(student._id)} className="border-red-800 text-red-400">
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
