import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Lock,
  Shield,
  Upload,
  X,
} from "lucide-react";
import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosApiInstance from "../interceptor";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

const UPLOAD_CONFIGS = [
  {
    id: "public",
    label: "Public Collection",
    description: "Accessible to all guest users through the public chat interface",
    endpoint: "/api/v1/admin/public/upload/pdf",
    icon: Upload,
    badgeLabel: "Guest Access",
    badgeClass:
      "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
    iconBg: "bg-emerald-900/30 border-emerald-700/40",
    iconColor: "text-emerald-400",
    buttonClass:
      "bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600",
    dropzoneBorder: "border-emerald-700/40 hover:border-emerald-500/60",
    dropzoneHover: "hover:bg-emerald-900/10",
  },
  {
    id: "private",
    label: "Private Collection",
    description: "Accessible only to authenticated students through the student chat portal",
    endpoint: "/api/v1/admin/private/upload/pdf",
    icon: Lock,
    badgeLabel: "Students Only",
    badgeClass:
      "bg-purple-900/50 text-purple-300 border-purple-700/50",
    iconBg: "bg-purple-900/30 border-purple-700/40",
    iconColor: "text-purple-400",
    buttonClass:
      "bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600",
    dropzoneBorder: "border-purple-700/40 hover:border-purple-500/60",
    dropzoneHover: "hover:bg-purple-900/10",
  },
];

const UploadSection = ({ config }) => {
  const fileInputRef = useRef(null);
  const [state, setState] = useState({
    file: null,
    isDragging: false,
    isUploading: false,
    result: null, // { success: bool, message: string }
  });

  const Icon = config.icon;

  const setFile = (f) => {
    if (!f) {
      setState((prev) => ({ ...prev, file: null, result: null }));
      return;
    }
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("File size must be under 20 MB");
      return;
    }
    setState((prev) => ({ ...prev, file: f, result: null }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isDragging: false }));
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, isDragging: true }));
  };

  const handleDragLeave = () => {
    setState((prev) => ({ ...prev, isDragging: false }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    e.target.value = "";
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleUpload = async () => {
    if (!state.file) {
      toast.error("Please select a PDF file first");
      return;
    }

    setState((prev) => ({ ...prev, isUploading: true, result: null }));

    const formData = new FormData();
    formData.append("pdf", state.file);

    try {
      const response = await axiosApiInstance.post(config.endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const message = response.data?.message || "File uploaded successfully";
      setState((prev) => ({
        ...prev,
        isUploading: false,
        file: null,
        result: { success: true, message },
      }));
      toast.success(message);
    } catch (error) {
      const message =
        error.response?.data?.message || "Upload failed. Please try again.";
      setState((prev) => ({
        ...prev,
        isUploading: false,
        result: { success: false, message },
      }));
      toast.error(message);
    }
  };

  return (
    <Card className="border-[#2c2c3a] bg-[#12121a]/95 backdrop-blur-sm shadow-xl">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${config.iconBg}`}
            >
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div>
              <CardTitle className="text-[#f1f0ff] text-base sm:text-lg">
                {config.label}
              </CardTitle>
              <p className="text-[#64748b] text-xs sm:text-sm mt-0.5">
                {config.description}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs shrink-0 ${config.badgeClass}`}
          >
            {config.badgeLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        {/* Result feedback */}
        {state.result && (
          <Alert
            className={`${
              state.result.success
                ? "bg-green-900/20 border-green-700/50 text-green-400"
                : "bg-red-900/20 border-red-700/50 text-red-400"
            }`}
          >
            {state.result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{state.result.message}</AlertDescription>
          </Alert>
        )}

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${config.dropzoneBorder} ${config.dropzoneHover} ${
            state.isDragging ? "scale-[1.01] bg-[#1c1c27]/80" : "bg-[#1c1c27]/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#2c2c3a] flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#a78bfa]" />
            </div>
            <div>
              <p className="text-[#f1f0ff] text-sm font-medium">
                {state.isDragging
                  ? "Drop your PDF here"
                  : "Drag & drop your PDF, or click to browse"}
              </p>
              <p className="text-[#64748b] text-xs mt-1">PDF only · Max 20 MB</p>
            </div>
          </div>
        </div>

        {/* Selected file preview */}
        {state.file && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1c1c27] border border-[#2c2c3a]">
            <div className="w-9 h-9 rounded-lg bg-red-900/30 border border-red-700/40 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#f1f0ff] text-sm font-medium truncate">
                {state.file.name}
              </p>
              <p className="text-[#64748b] text-xs">{formatSize(state.file.size)}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="shrink-0 h-8 w-8 p-0 text-[#64748b] hover:text-red-400 hover:bg-[#2c2c3a]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Upload button */}
        <Button
          onClick={handleUpload}
          disabled={!state.file || state.isUploading}
          className={`w-full h-11 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonClass}`}
        >
          {state.isUploading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload to {config.label}
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

UploadSection.propTypes = {
  config: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    endpoint: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    badgeLabel: PropTypes.string.isRequired,
    badgeClass: PropTypes.string.isRequired,
    iconBg: PropTypes.string.isRequired,
    iconColor: PropTypes.string.isRequired,
    buttonClass: PropTypes.string.isRequired,
    dropzoneBorder: PropTypes.string.isRequired,
    dropzoneHover: PropTypes.string.isRequired,
  }).isRequired,
};

const PDFUpload = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1c1c27]/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-[#2c2c3a]">
            <Shield className="h-4 w-4 text-[#a78bfa]" />
            <span className="text-sm font-medium text-[#f1f0ff]">
              Admin — Knowledge Base
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#f1f0ff] to-[#a78bfa] bg-clip-text text-transparent mb-2">
            Upload PDF Documents
          </h1>
          <p className="text-[#64748b] text-sm max-w-md mx-auto">
            Add PDF documents to the RAG knowledge base. Choose the target
            collection based on who should have access.
          </p>
        </div>

        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-[#a78bfa] hover:text-[#f1f0ff] hover:bg-[#1c1c27]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Info banner */}
        <div className="mb-6 p-4 rounded-xl bg-[#1c1c27]/80 border border-[#2c2c3a] flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-[#a78bfa] shrink-0 mt-0.5" />
          <p className="text-[#a78bfa] text-xs sm:text-sm">
            Uploaded documents are processed asynchronously. The content will
            become available in the AI chat after processing completes.
          </p>
        </div>

        <Separator className="bg-[#2c2c3a] mb-6" />

        {/* Upload sections */}
        <div className="space-y-6">
          {UPLOAD_CONFIGS.map((config) => (
            <UploadSection key={config.id} config={config} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PDFUpload;
