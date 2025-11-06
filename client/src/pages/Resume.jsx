// client/src/pages/ResumeUploader.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoDocumentTextOutline,
  IoCloudUploadOutline,
  IoTrashOutline,
  IoLinkOutline,
  IoOpenOutline,
} from "react-icons/io5";
import { IoIosArrowBack, IoIosBulb } from "react-icons/io";

/*
// Uncomment when you install PDF preview dependencies
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
*/

// --- Mock Data ---
const MOCK_FILES = [
  {
    id: 1,
    name: "Balakrishna Resume (Latest SDE).pdf",
    size: "187.7 KB",
    date: "5/11/2025",
    url: "mock_url_1",
    role: "Software Engineer",
    localFile: null,
  },
  {
    id: 2,
    name: "Balakrishna Resume (PM Focus).pdf",
    size: "170.1 KB",
    date: "2/10/2025",
    url: "mock_url_2",
    role: "Product Manager",
    localFile: null,
  },
];

// --- AI Suggestions ---
const AI_SUGGESTIONS = {
  1: [
    "Suggestion: Highlight 'System Design' experience for Senior SDE roles.",
    "Critique: The 'AWS' section is too brief. Elaborate on managed services used.",
    "Action: Add a quantifiable metric to the project on 'React performance optimization'.",
  ],
  2: [
    "Suggestion: Strengthen the 'Go-to-Market Strategy' section with specific outcomes.",
    "Critique: Ensure all product achievements follow the 'Result-Action-Challenge' format.",
    "Action: Clearly define the impact of the 'Agile' practices introduced (e.g., cycle time reduction).",
  ],
  default: [
    "Suggestion: Run your resume through a keyword analysis tool for ATS compatibility.",
    "Critique: Ensure your contact information is prominently displayed.",
    "Action: Tailor this resume to a specific job description for maximum impact.",
  ],
};

// --- AI Suggestions Panel ---
const AiSuggestionsPanel = ({ activeFile }) => {
  if (!activeFile) return null;
  const suggestions = AI_SUGGESTIONS[activeFile.id] || AI_SUGGESTIONS.default;

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 mt-8">
      <h2 className="text-xl font-semibold flex items-center text-pink-400 mb-4">
        <IoIosBulb className="text-2xl mr-2" />
        AI Resume Suggestions ({activeFile.role || "New Resume"})
      </h2>
      <ul className="space-y-3">
        {suggestions.map((s, index) => (
          <li
            key={index}
            className="flex items-start text-sm bg-gray-700 p-3 rounded-lg border-l-4 border-pink-600"
          >
            <span className="text-pink-400 mr-2 flex-shrink-0">●</span>
            <p className="text-gray-300">{s}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- Uploaded File Row ---
const UploadedFileRow = ({ file, isActive, onSelect, onDelete }) => (
  <div
    onClick={() => onSelect(file)}
    className={`flex justify-between items-center p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
      isActive
        ? "bg-pink-600/50 border border-pink-500 text-white shadow-lg"
        : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
    }`}
  >
    <div className="flex-grow">
      <p className="font-semibold text-lg">{file.name}</p>
      <p className="text-sm text-gray-400">
        {file.size} • Role: {file.role || "N/A"}
      </p>
    </div>
    <div className="flex space-x-3">
      <button
        onClick={(e) => {
          e.stopPropagation();
          alert("Linking action triggered!");
        }}
        aria-label="Link Resume"
      >
        <IoLinkOutline className="w-5 h-5 text-purple-500 hover:text-purple-400 transition" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(file.id);
        }}
        aria-label="Delete Resume"
      >
        <IoTrashOutline className="w-5 h-5 text-red-500 hover:text-red-400 transition" />
      </button>
    </div>
  </div>
);

// --- Mock PDF Viewer ---
const MockPdfViewer = ({ file, onOpenSystem }) => {
  const fileSource = file?.localFile;

  if (!fileSource) {
    return (
      <div className="w-full h-[500px] bg-gray-900 border border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500">
        <IoDocumentTextOutline className="w-12 h-12 mb-2" />
        <p>No document selected or preview source missing.</p>
      </div>
    );
  }

  return (
    <div
      onClick={onOpenSystem}
      className="w-full h-[500px] bg-gray-900 border border-gray-700 rounded-lg shadow-inner flex flex-col items-center justify-center p-4 cursor-pointer relative group transition-all duration-300 hover:shadow-pink-500/50 hover:border-pink-500"
    >
      <div className="absolute inset-0 bg-gray-700/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="flex items-center text-white text-lg font-semibold bg-pink-600 px-4 py-2 rounded-full shadow-xl">
          <IoOpenOutline className="text-2xl mr-2" /> Open {file.name}
        </div>
      </div>

      <IoDocumentTextOutline className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <p className="text-lg font-semibold text-white mb-2">Preview Successful!</p>
      <p className="text-sm text-gray-400">
        File: {file.name} is ready for client-side viewing.
      </p>
    </div>
  );
};

// --- Main Component ---
export default function ResumeUploader() {
  const navigate = useNavigate();

  const [uploadedFiles, setUploadedFiles] = useState(MOCK_FILES);
  const [activeFile, setActiveFile] = useState(MOCK_FILES[0] || null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!activeFile && uploadedFiles.length > 0) {
      setActiveFile(uploadedFiles[0]);
    }
  }, [uploadedFiles, activeFile]);

  const handleOpenSystem = useCallback(() => {
    if (activeFile && activeFile.localFile) {
      window.open(activeFile.localFile, "_blank");
    } else {
      alert("Cannot open file. Please upload a PDF or DOCX file first.");
    }
  }, [activeFile]);

  const handleDelete = useCallback(
    (id) => {
      setUploadedFiles((files) => {
        const newFiles = files.filter((f) => f.id !== id);

        const deletedFile = files.find((f) => f.id === id);
        if (deletedFile && deletedFile.localFile) {
          URL.revokeObjectURL(deletedFile.localFile);
        }

        if (activeFile && activeFile.id === id) {
          setActiveFile(newFiles[0] || null);
        }
        return newFiles;
      });
    },
    [activeFile]
  );

  const handleFileUpload = (files) => {
    if (files.length === 0) return;

    const file = files[0];
    const localFileUrl = URL.createObjectURL(file);

    const newFile = {
      id: Date.now(),
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      date: new Date().toLocaleDateString(),
      url: null,
      role: "Unknown",
      localFile: localFileUrl,
    };

    setUploadedFiles((prev) => [newFile, ...prev]);
    setActiveFile(newFile);
  };

  // --- Drag Events ---
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.includes("pdf") || f.type.includes("document")
    );
    handleFileUpload(files);
  };

  const handleFileChange = (e) => {
    handleFileUpload(Array.from(e.target.files));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-pink-500">Resume Management</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-white transition flex items-center"
          >
            <IoIosArrowBack className="text-xl mr-1" /> Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Resume */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
              <div
                className={`border-2 ${
                  isDragging
                    ? "border-pink-500 bg-gray-700/50"
                    : "border-gray-700 border-dashed"
                } rounded-xl p-10 text-center transition-colors`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <IoCloudUploadOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">
                  Drag & drop your PDF/DOCX file here or click to browse
                </p>

                <input
                  id="file-upload-input"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />

                <button
                  onClick={() =>
                    document.getElementById("file-upload-input").click()
                  }
                  className="flex items-center mx-auto px-6 py-3 rounded-xl bg-pink-600 font-semibold text-white shadow-lg hover:bg-pink-700 transition"
                >
                  <IoCloudUploadOutline className="text-xl mr-2" />
                  Select File
                </button>
              </div>
            </div>

            {/* Uploaded Files */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-300">
                Your Documents ({uploadedFiles.length})
              </h2>
              <div className="space-y-3">
                {uploadedFiles.length === 0 ? (
                  <p className="text-gray-400 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    No resumes uploaded yet.
                  </p>
                ) : (
                  uploadedFiles.map((file) => (
                    <UploadedFileRow
                      key={file.id}
                      file={file}
                      isActive={activeFile && activeFile.id === file.id}
                      onSelect={setActiveFile}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="sticky top-4">
              <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Resume Preview</h2>
                <MockPdfViewer file={activeFile} onOpenSystem={handleOpenSystem} />
              </div>
              <AiSuggestionsPanel activeFile={activeFile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
