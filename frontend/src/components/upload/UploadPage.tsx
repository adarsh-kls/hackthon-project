
import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  X,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ScanSearch,
} from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "txt",
  "csv",
  "xls",
  "xlsx",
  "png",
  "jpg",
  "jpeg",
];

function getFileIcon(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (["png", "jpg", "jpeg"].includes(extension || "")) {
    return FileImage;
  }

  if (["csv", "xls", "xlsx"].includes(extension || "")) {
    return FileSpreadsheet;
  }

  if (["pdf", "doc", "docx", "txt"].includes(extension || "")) {
    return FileText;
  }

  return File;
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  const validateFile = (file: File) => {
    setError("");
    setMessage("");

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      setError("Unsupported file format. Please select a supported document.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 10 MB. Please select a smaller file.");
      return;
    }

    if (file.size === 0) {
      setError("This file is empty. Please select another file.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      validateFile(file);
    }

    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      validateFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError("");
    setMessage("");
  };

  const handleSampleScan = () => {
    if (!selectedFile) {
      setError("Please select a document first.");
      return;
    }

    setMessage(
      "File selected successfully. Backend scanning is not connected yet."
    );
  };

  const FileIcon = selectedFile
    ? getFileIcon(selectedFile.name)
    : FileText;

  return (
    <div className="mx-auto max-w-5xl">

      {/* Heading */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Upload size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Upload Document
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Upload a document to prepare it for security analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Upload area */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-14 text-center transition ${
            dragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
          }`}
        >
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Upload size={30} />
          </div>

          <h2 className="text-lg font-bold text-slate-800">
            Drag and drop your document here
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Or click below to browse files from your computer
          </p>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Browse Files
          </button>

          <p className="mt-5 text-xs text-slate-400">
            Maximum file size: 10 MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Supported formats */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700">
            Supported File Formats
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {["PDF", "DOC", "DOCX", "TXT", "CSV", "XLS", "XLSX", "PNG", "JPG"].map(
              (format) => (
                <span
                  key={format}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  {format}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Selected file */}
      {selectedFile && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileIcon size={24} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">
                  {selectedFile.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatFileSize(selectedFile.size)} · Ready for review
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle size={14} />
                Selected
              </span>

              <button
                onClick={handleRemoveFile}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Remove selected file"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
            <button
              onClick={handleRemoveFile}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Clear File
            </button>

            <button
              onClick={handleSampleScan}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <ScanSearch size={18} />
              Prepare Scan
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success message */}
      {message && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle size={19} className="mt-0.5 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {/* Security note */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-5">
        <ShieldCheck size={22} className="mt-0.5 shrink-0 text-blue-600" />

        <div>
          <h3 className="text-sm font-bold text-blue-900">
            Document Security
          </h3>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            SENTINEL is designed to analyze documents for potential security
            threats and sensitive information. Actual scanning will be enabled
            after backend integration.
          </p>
        </div>
      </div>

    </div>
  );
}

export default UploadPage;
