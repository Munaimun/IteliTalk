import {
  ArrowLeft,
  Building,
  Edit3,
  GraduationCap,
  Hash,
  Mail,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosApiInstance from "../interceptor";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

const API_URL = "/api/v1/admin";

const UserDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosApiInstance.get(`${API_URL}/user/${id}`);
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching user data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosApiInstance.delete(`${API_URL}/user/${id}`);
      toast.success("User deleted successfully!");
      navigate("/admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting user");
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-8 px-4 flex items-start justify-center">
        <div className="w-full max-w-lg space-y-4">
          <Card className="border-[#2c2c3a] bg-[#12121a]">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-center mb-2">
                <Skeleton className="w-20 h-20 rounded-full bg-[#1c1c27]" />
              </div>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full bg-[#1c1c27]" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-8 px-4 flex items-center justify-center">
        <div className="text-center py-16">
          <p className="text-red-400 text-lg mb-4">{error || "User not found"}</p>
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            className="border-[#2c2c3a] text-[#a78bfa] hover:bg-[#1c1c27]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const infoRows = [
    { icon: User, label: "Full Name", value: user.name },
    { icon: Mail, label: "Email Address", value: user.email },
    { icon: Hash, label: "Student ID", value: user.studentId },
    { icon: Building, label: "Department", value: user.dept },
    {
      icon: user.role === "Admin" ? Shield : GraduationCap,
      label: "Role",
      value: user.role,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-8 px-4 sm:px-6 flex items-start justify-center">
      <div className="w-full max-w-lg">
        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1c1c27]/80 rounded-full px-4 py-2 mb-4 border border-[#2c2c3a]">
            <User className="h-4 w-4 text-[#a78bfa]" />
            <span className="text-sm font-medium text-[#f1f0ff]">
              Admin — User Detail
            </span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#f1f0ff] to-[#a78bfa] bg-clip-text text-transparent">
            {user.name}
          </h1>
        </div>

        <Card className="border-[#2c2c3a] bg-[#12121a]/95 shadow-2xl">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 text-[#a78bfa] hover:text-[#f1f0ff] hover:bg-[#1c1c27]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
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
                {user.role}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
            {/* Avatar */}
            <div className="flex justify-center mb-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-[#2c2c3a] flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-[#f1f0ff]">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>

            <Separator className="bg-[#2c2c3a]" />

            {/* Info rows */}
            <div className="space-y-3">
              {infoRows.map(
                ({ icon: Icon, label, value }) =>
                  value && (
                    <div
                      key={label}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#1c1c27] border border-[#2c2c3a]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#2c2c3a] flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-[#a78bfa]" />
                      </div>
                      <div>
                        <p className="text-[#64748b] text-xs">{label}</p>
                        <p className="text-[#f1f0ff] text-sm font-medium">
                          {value}
                        </p>
                      </div>
                    </div>
                  )
              )}
            </div>

            <Separator className="bg-[#2c2c3a]" />

            {/* Actions */}
            {!confirmDelete ? (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/user/edit/${id}`)}
                  className="flex-1 h-10 border-[#2c2c3a] bg-transparent text-[#a78bfa] hover:bg-[#1c1c27] hover:text-[#f1f0ff]"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => setConfirmDelete(true)}
                  className="flex-1 h-10 bg-red-900/30 text-red-400 border border-red-700/50 hover:bg-red-800/50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-[#f1f0ff] text-sm font-medium">
                  Are you sure you want to delete{" "}
                  <span className="text-red-400">{user.name}</span>?
                </p>
                <p className="text-center text-[#64748b] text-xs">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 h-10 border-[#2c2c3a] bg-transparent text-[#64748b] hover:bg-[#1c1c27]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 h-10 bg-red-700 hover:bg-red-600 text-white"
                  >
                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Deleting...
                      </div>
                    ) : (
                      "Confirm Delete"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDetail;
