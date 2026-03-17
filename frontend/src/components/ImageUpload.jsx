import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ImagePlus, X, Sparkles } from "lucide-react";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = { "image/jpeg": [], "image/png": [], "image/webp": [], "image/bmp": [] };

export default function ImageUpload({ onFileSelected, selectedFile, disabled }) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const onDrop = useCallback(
    (accepted, rejected) => {
      setDragActive(false);
      if (rejected.length > 0) {
        const reason = rejected[0].errors[0]?.message || "File rejected";
        alert(`Upload error: ${reason}`);
        return;
      }
      if (accepted.length > 0) {
        const file = accepted[0];
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const clearFile = (e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onFileSelected(null);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden
          ${isDragActive || dragActive
            ? "border-2 border-neural-400 bg-neural-950/60 shadow-lg shadow-neural-600/20"
            : selectedFile
            ? "border-2 border-accent-500/60 bg-surface-700/40"
            : "border-2 border-dashed border-surface-500 hover:border-neural-500/60 bg-surface-800/50 hover:bg-surface-700/50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        {/* Animated corner accents when dragging */}
        {isDragActive && (
          <>
            <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neural-400 rounded-tl-2xl" />
            <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neural-400 rounded-tr-2xl" />
            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neural-400 rounded-bl-2xl" />
            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neural-400 rounded-br-2xl" />
          </>
        )}

        {previewUrl && selectedFile ? (
          /* ── Preview State ── */
          <div className="p-4">
            <div className="relative group">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-72 object-contain rounded-xl mx-auto block"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 rounded-xl bg-surface-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <span className="text-sm text-slate-300 font-medium">Drop a new image to replace</span>
              </div>
              {/* Remove button */}
              {!disabled && (
                <button
                  onClick={clearFile}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-surface-900/80 border border-surface-500
                             text-slate-400 hover:text-danger-400 hover:border-danger-500/50
                             transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {/* File info bar */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full bg-accent-400 shrink-0 animate-pulse" />
                <span className="text-sm text-slate-300 truncate font-mono">{selectedFile.name}</span>
              </div>
              <span className="text-xs text-slate-500 shrink-0 ml-2">
                {(selectedFile.size / 1024).toFixed(0)} KB
              </span>
            </div>
          </div>
        ) : (
          /* ── Empty / Drag State ── */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center select-none">
            <div className={`
              relative mb-5 p-4 rounded-2xl transition-all duration-300
              ${isDragActive ? "bg-neural-600/30 scale-110" : "bg-surface-700/60"}
            `}>
              {isDragActive ? (
                <Sparkles size={32} className="text-neural-400" />
              ) : (
                <ImagePlus size={32} className="text-slate-500" />
              )}
            </div>

            {isDragActive ? (
              <p className="text-neural-300 font-semibold text-base">Release to analyse</p>
            ) : (
              <>
                <p className="text-slate-300 font-semibold text-base mb-1">
                  Drop your image here
                </p>
                <p className="text-slate-500 text-sm mb-5">or click to browse files</p>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neural-600/20 border border-neural-500/30">
                  <Upload size={14} className="text-neural-400" />
                  <span className="text-xs text-neural-300 font-medium">Choose Image</span>
                </div>
                <p className="text-xs text-slate-600 mt-4">
                  JPEG, PNG, WebP, BMP · Max 10 MB
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
