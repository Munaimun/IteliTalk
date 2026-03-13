import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye,
  FileUp,
  Home,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import axiosApiInstance from "../interceptor";

const API_URL = "/api/v1";

const Admin = () => {
  // Consolidated state management
  const [data, setData] = useState({
    users: [],
    admins: [],
    isLoading: false,
    error: null,
  });

  const [ui, setUi] = useState({
    sidebarOpen: true,
    mobileMenuOpen: false,
    activeTab: "dashboard",
    searchTerm: "",
    sortBy: "name",
    sortOrder: "asc",
    currentPage: 1,
    itemsPerPage: 10,
    filterDepartment: "all",
    filterStatus: "all",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Navigation items
  const navigationItems = [
    {
      name: "Dashboard",
      icon: Home,
      id: "dashboard",
      active: ui.activeTab === "dashboard",
    },
    {
      name: "Students",
      icon: Users,
      id: "students",
      active: ui.activeTab === "students",
      count: data.users.length,
    },
    {
      name: "Admins",
      icon: Shield,
      id: "admins",
      active: ui.activeTab === "admins",
      count: data.admins.length,
    },
  ];

  // Memoized computed values with pagination
  const {
    filteredUsers,
    filteredAdmins,
    totalUsers,
    totalAdmins,
    paginatedUsers,
    paginatedAdmins,
    totalPages,
    departmentStats,
  } = useMemo(() => {
    const filterAndSort = (items) => {
      return items
        .filter((item) => {
          const matchesSearch =
            item.name?.toLowerCase().includes(ui.searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(ui.searchTerm.toLowerCase()) ||
            item.studentId
              ?.toLowerCase()
              .includes(ui.searchTerm.toLowerCase()) ||
            item.dept?.toLowerCase().includes(ui.searchTerm.toLowerCase());

          const matchesDepartment =
            ui.filterDepartment === "all" || item.dept === ui.filterDepartment;

          return matchesSearch && matchesDepartment;
        })
        .sort((a, b) => {
          const aVal = a[ui.sortBy]?.toLowerCase() || "";
          const bVal = b[ui.sortBy]?.toLowerCase() || "";
          return ui.sortOrder === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        });
    };

    const filteredUsersList = filterAndSort(data.users);
    const filteredAdminsList = filterAndSort(data.admins);

    // Pagination logic
    const startIndex = (ui.currentPage - 1) * ui.itemsPerPage;
    const endIndex = startIndex + ui.itemsPerPage;

    const currentList =
      ui.activeTab === "students" ? filteredUsersList : filteredAdminsList;
    const totalPages = Math.ceil(currentList.length / ui.itemsPerPage);

    // Department statistics
    const deptStats = {};
    [...data.users, ...data.admins].forEach((user) => {
      if (user.dept) {
        deptStats[user.dept] = (deptStats[user.dept] || 0) + 1;
      }
    });

    return {
      filteredUsers: filteredUsersList,
      filteredAdmins: filteredAdminsList,
      paginatedUsers: filteredUsersList.slice(startIndex, endIndex),
      paginatedAdmins: filteredAdminsList.slice(startIndex, endIndex),
      totalUsers: data.users.length,
      totalAdmins: data.admins.length,
      totalPages,
      departmentStats: deptStats,
    };
  }, [
    data.users,
    data.admins,
    ui.searchTerm,
    ui.sortBy,
    ui.sortOrder,
    ui.currentPage,
    ui.itemsPerPage,
    ui.activeTab,
    ui.filterDepartment,
  ]);

  // Fetch function with better error handling
  const fetchUsersAndAdmins = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setData((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await axiosApiInstance.get(`${API_URL}/admin/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        const students = response.data.data.filter(
          (user) => user.role === "Student"
        );
        const adminList = response.data.data.filter(
          (user) => user.role === "Admin"
        );

        setData((prev) => ({
          ...prev,
          users: students,
          admins: adminList,
          isLoading: false,
        }));

        toast.success("Data refreshed successfully");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch data";
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchUsersAndAdmins();
  }, [fetchUsersAndAdmins]);

  // UI update functions
  const updateUi = (updates) => {
    setUi((prev) => ({
      ...prev,
      ...updates,
      ...(updates.searchTerm !== undefined || updates.itemsPerPage !== undefined
        ? { currentPage: 1 }
        : {}),
    }));
  };

  const handleSort = (key) => {
    updateUi({
      sortBy: key,
      sortOrder: ui.sortBy === key && ui.sortOrder === "asc" ? "desc" : "asc",
      currentPage: 1,
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set(
      [...data.users, ...data.admins].map((user) => user.dept).filter(Boolean)
    );
    return Array.from(depts);
  }, [data.users, data.admins]);

  // Statistics for dashboard
  const stats = [
    {
      title: "Total Students",
      value: totalUsers.toLocaleString(),
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Active Admins",
      value: totalAdmins.toLocaleString(),
      change: "+2",
      trend: "up",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Departments",
      value: departments.length.toString(),
      change: "0%",
      trend: "neutral",
      icon: Home,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Admin Ratio",
      value:
        totalUsers > 0
          ? `${Math.round((totalAdmins / totalUsers) * 100)}%`
          : "0%",
      change: "+1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render data table
  const renderDataTable = (items, columns, title, totalCount) => (
    <Card className="shadow-sm border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            {title}
            <Badge variant="secondary" className="ml-2">
              {totalCount}
            </Badge>
          </CardTitle>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={ui.searchTerm}
                onChange={(e) => updateUi({ searchTerm: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Department Filter */}
            <Select
              value={ui.filterDepartment}
              onValueChange={(value) => updateUi({ filterDepartment: value })}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={fetchUsersAndAdmins}
              disabled={data.isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${data.isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={
                        col.sortable !== false
                          ? "cursor-pointer hover:bg-muted transition-colors"
                          : ""
                      }
                      onClick={() =>
                        col.sortable !== false && handleSort(col.key)
                      }
                    >
                      <div className="flex items-center gap-2">
                        {col.label}
                        {col.sortable !== false &&
                          ui.sortBy === col.key &&
                          (ui.sortOrder === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="text-center text-muted-foreground py-12"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground/50" />
                        <p>No {title.toLowerCase()} found</p>
                        <p className="text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, index) => (
                    <TableRow
                      key={item._id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          {col.render
                            ? col.render(item, index)
                            : item[col.key] || "N/A"}
                        </TableCell>
                      ))}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/user/${item._id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show</span>
                <Select
                  value={ui.itemsPerPage.toString()}
                  onValueChange={(value) =>
                    updateUi({ itemsPerPage: parseInt(value) })
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>per page</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {ui.currentPage} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateUi({ currentPage: 1 })}
                    disabled={ui.currentPage === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateUi({ currentPage: ui.currentPage - 1 })
                    }
                    disabled={ui.currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateUi({ currentPage: ui.currentPage + 1 })
                    }
                    disabled={ui.currentPage === totalPages}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateUi({ currentPage: totalPages })}
                    disabled={ui.currentPage === totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Showing {(ui.currentPage - 1) * ui.itemsPerPage + 1} to{" "}
            {Math.min(
              ui.currentPage * ui.itemsPerPage,
              (ui.activeTab === "students" ? filteredUsers : filteredAdmins)
                .length
            )}{" "}
            of{" "}
            {
              (ui.activeTab === "students" ? filteredUsers : filteredAdmins)
                .length
            }{" "}
            results
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Table columns
  const userColumns = [
    {
      key: "avatar",
      label: "",
      sortable: false,
      render: (user) => (
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="bg-blue-100 text-blue-600">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (user) => (
        <div className="space-y-1">
          <Link
            className="font-medium text-primary hover:underline"
            to={`/user/${user._id}`}
          >
            {user.name}
          </Link>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      ),
    },
    {
      key: "studentId",
      label: "Student ID",
      render: (user) => (
        <Badge variant="outline" className="font-mono">
          {user.studentId}
        </Badge>
      ),
    },
    {
      key: "dept",
      label: "Department",
      render: (user) => <Badge variant="secondary">{user.dept}</Badge>,
    },
  ];

  const adminColumns = [
    {
      key: "avatar",
      label: "",
      sortable: false,
      render: (admin) => (
        <Avatar className="h-10 w-10">
          <AvatarImage src={admin.avatar} />
          <AvatarFallback className="bg-purple-100 text-purple-600">
            {admin.name?.charAt(0)?.toUpperCase() || "A"}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (admin) => (
        <div className="space-y-1">
          <span className="font-medium">{admin.name}</span>
          <p className="text-sm text-muted-foreground">{admin.email}</p>
        </div>
      ),
    },
    {
      key: "dept",
      label: "Department",
      render: (admin) => <Badge variant="secondary">{admin.dept}</Badge>,
    },
    {
      key: "role",
      label: "Role",
      render: () => (
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <Shield className="mr-1 h-3 w-3" />
          Administrator
        </Badge>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900  flex gap-6">
      {/* Mobile Menu Backdrop */}
      {ui.mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => updateUi({ mobileMenuOpen: false })}
        />
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={item.active ? "default" : "ghost"}
              className={`
                  w-full justify-start gap-3 h-11 transition-all duration-200
                  ${!ui.sidebarOpen ? "px-3" : "px-4"}
                  ${
                    item.active
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md"
                      : "hover:bg-gray-800"
                  }
                `}
              onClick={() =>
                updateUi({
                  activeTab: item.id,
                  currentPage: 1,
                  searchTerm: "",
                })
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {ui.sidebarOpen && (
                <div className="flex items-center justify-between w-full">
                  <span>{item.name}</span>
                  {item.count !== undefined && (
                    <Badge
                      variant={item.active ? "secondary" : "outline"}
                      className={`ml-2 ${
                        item.active
                          ? "bg-white/20 text-white border-white/30"
                          : ""
                      }`}
                    >
                      {item.count}
                    </Badge>
                  )}
                </div>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Action Buttons */}
      <div className="p-4 space-y-2 border-t border-gray-200/50 dark:border-gray-800/50">
        <Button
          variant="default"
          className={`w-full justify-start gap-3 h-11 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 ${
            !ui.sidebarOpen ? "px-3" : "px-4"
          }`}
          onClick={() => navigate("/signup")}
        >
          <UserPlus className="h-5 w-5 flex-shrink-0" />
          {ui.sidebarOpen && <span>Add Student</span>}
        </Button>

        <Button
          variant="default"
          className={`w-full justify-start gap-3 h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 ${
            !ui.sidebarOpen ? "px-3" : "px-4"
          }`}
          onClick={() => navigate("/signupadmin")}
        >
          <Plus className="h-5 w-5 flex-shrink-0" />
          {ui.sidebarOpen && <span>Add Teacher</span>}
        </Button>

        <Button
          variant="default"
          className={`w-full justify-start gap-3 h-11 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 ${
            !ui.sidebarOpen ? "px-3" : "px-4"
          }`}
          onClick={() => navigate("/admin/upload")}
        >
          <FileUp className="h-5 w-5 flex-shrink-0" />
          {ui.sidebarOpen && <span>Upload PDF</span>}
        </Button>

        <Separator className="my-2 bg-gray-200/50 dark:bg-gray-800/50" />

        <Button
          variant="outline"
          className={`w-full justify-start gap-3 h-11 border-gray-700 hover:bg-gray-900 ${
            !ui.sidebarOpen ? "px-3" : "px-4"
          }`}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {ui.sidebarOpen && <span>Logout</span>}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-4 lg:my-4">
        {/* Top Header */}
        <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 px-4 lg:px-6 py-4 lg:rounded-t-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateUi({ mobileMenuOpen: true })}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage students, administrators, and system settings
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 lg:pb-0 overflow-auto bg-gray-900/50 lg:rounded-b-xl backdrop-blur-sm">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Error Alert */}
            {data.error && (
              <Alert variant="destructive" className="shadow-sm">
                <AlertDescription className="flex items-center justify-between">
                  <span>{data.error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsersAndAdmins}
                    className="ml-4"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {data.isLoading ? (
              renderSkeleton()
            ) : (
              <>
                {/* Dashboard Stats */}
                {ui.activeTab === "dashboard" && (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                          <Card
                            key={stat.title}
                            className="hover:shadow-lg transition-all duration-200 border-gray-800/50 bg-gray-900/80 backdrop-blur-sm"
                          >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium text-gray-400">
                                {stat.title}
                              </CardTitle>
                              <div
                                className={`p-3 rounded-lg ${stat.bgColor} shadow-sm`}
                              >
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-white">
                                {stat.value}
                              </div>
                              <p
                                className={`text-xs ${
                                  stat.trend === "up"
                                    ? "text-green-600"
                                    : stat.trend === "down"
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {stat.change} from last month
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Department Statistics */}
                    <Card className="shadow-sm border-gray-800/50 bg-gray-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Department Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(departmentStats).map(
                            ([dept, count]) => (
                              <div
                                key={dept}
                                className="flex items-center justify-between p-4 bg-gray-800/80 rounded-lg backdrop-blur-sm border border-gray-700/30"
                              >
                                <span className="font-medium">{dept}</span>
                                <Badge
                                  variant="secondary"
                                  className="shadow-sm"
                                >
                                  {count}
                                </Badge>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="shadow-sm border-gray-800/50 bg-gray-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Recent Registrations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[...data.users, ...data.admins]
                            .slice(0, 5)
                            .map((user) => (
                              <div
                                key={user._id}
                                className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/30 hover:bg-gray-700/50 transition-colors"
                              >
                                <Avatar className="h-10 w-10 shadow-sm">
                                  <AvatarFallback>
                                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {user.email}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge
                                    variant={
                                      user.role === "Admin"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="shadow-sm"
                                  >
                                    {user.role}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {user.dept}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Students Table */}
                {ui.activeTab === "students" &&
                  renderDataTable(
                    paginatedUsers,
                    userColumns,
                    "Students",
                    filteredUsers.length
                  )}

                {/* Admins Table */}
                {ui.activeTab === "admins" &&
                  renderDataTable(
                    paginatedAdmins,
                    adminColumns,
                    "Administrators",
                    filteredAdmins.length
                  )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
