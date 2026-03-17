import React from "react";
import { ScanLine } from "lucide-react";

export default function LoadingSpinner({ uploadProgress }) {
  const isUploading = uploadProgress !== null && uploadProgress < 100;

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      {/* Spinner rings */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-2 border-neural-800" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-neural-400 animate-spin" />
        <div className="absolute inset-2 w-12 h-12 rounded-full border-2 border-transparent border-t-neural-600 animate-spin-slow" style={{ animationDirection: "reverse" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <ScanLine size={18} className="text-neural-400 animate-pulse" />
        </div>
      </div>

      {isUploading ? (
        <>
          <p className="text-sm font-semibold text-slate-300 mb-3">Uploading image…</p>
          <div className="w-40 h-1.5 rounded-full bg-surface-600 overflow-hidden">
            <div
              className="h-full rounded-full bg-neural-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-neural-400 font-mono mt-2">{uploadProgress}%</p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate-300 mb-1">Running YOLOv8…</p>
          <p className="text-xs text-slate-500">Detecting objects in your image</p>
          {/* Scanning animation */}
          <div className="mt-6 flex gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-neural-500 animate-pulse"
                style={{
                  height: `${8 + Math.abs(2 - i) * 4}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
