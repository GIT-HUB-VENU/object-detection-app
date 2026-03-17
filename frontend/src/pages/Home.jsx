import React, { useState, useCallback, useRef } from "react";
import { Scan, Zap, AlertCircle, RotateCcw } from "lucide-react";
import ImageUpload from "../components/ImageUpload";
import DetectionResult from "../components/DetectionResult";
import HistoryPanel from "../components/HistoryPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import { detectObjects } from "../api/api";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult]             = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const resultRef = useRef(null);

  const handleFileSelected = useCallback((file) => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setUploadProgress(null);
  }, []);

  const handleDetect = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setUploadProgress(0);

    try {
      const data = await detectObjects(selectedFile, setUploadProgress);
      setResult(data);
      setHistoryRefresh((n) => n + 1);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (e) {
      setError(e.message || "Detection failed. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setUploadProgress(null);
  };

  // Load a history record into result view
  // result_image_url from history is already an absolute URL (built by serializer)
  // DetectionResult expects result_image as a path that it prepends BASE_URL to,
  // so we pass a special flag to indicate full URL
  const handleHistorySelect = (rec) => {
    setResult({
      detections: rec.detections || [],
      // result_image_url from history serializer is already absolute
      result_image: rec.result_image_url || "",
      result_image_is_absolute: true,
      object_count: rec.object_count,
      unique_labels: rec.unique_labels
        ? rec.unique_labels.split(", ").filter(Boolean)
        : [],
      processing_time_ms: rec.processing_time_ms,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-surface-900 bg-grid-pattern bg-grid bg-radial-neural">
      {/* Floating ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="particle absolute top-1/4 left-1/5 w-64 h-64 rounded-full bg-neural-600/5 blur-3xl" style={{"--dur":"8s"}} />
        <div className="particle absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-neural-800/8 blur-3xl" style={{"--dur":"12s",animationDelay:"3s"}} />
        <div className="particle absolute top-3/4 left-1/2 w-48 h-48 rounded-full bg-accent-500/5 blur-3xl" style={{"--dur":"10s",animationDelay:"1s"}} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-neural-600/15 border border-neural-500/25 mb-6">
            <Zap size={12} className="text-neural-400" />
            <span className="text-xs text-neural-300 font-medium tracking-wide">
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-4">
            Neural<span className="text-neural-400">Eye</span>
          </h1><span className="text-xs text-neural-300 font-medium tracking-wide">
              
            </span>
          <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Upload any image and let deep learning identify every object in real time.
          </p>
        </header>

        {/* ── Main layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left column ── */}
          <div className="space-y-4">
            <div className="glass-strong rounded-2xl p-5">
              <p className="section-heading mb-4">Upload Image</p>
              <ImageUpload
                onFileSelected={handleFileSelected}
                selectedFile={selectedFile}
                disabled={loading}
              />

              {/* Error banner */}
              {error && (
                <div className="mt-4 flex items-start gap-3 p-4 rounded-xl
                                bg-danger-500/10 border border-danger-500/30 animate-fade-in">
                  <AlertCircle size={16} className="text-danger-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-danger-400">Detection Error</p>
                    <p className="text-xs text-danger-400/70 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handleDetect}
                  disabled={!selectedFile || loading}
                  className="btn-primary flex-1 justify-center py-3.5"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analysing…
                    </>
                  ) : (
                    <>
                      <Scan size={16} />
                      Detect Objects
                    </>
                  )}
                </button>
                {(selectedFile || result) && !loading && (
                  <button onClick={handleReset} className="btn-ghost">
                    <RotateCcw size={14} />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Tips card */}
            <div className="glass rounded-2xl p-4">
              <p className="section-heading mb-3">Tips for best results</p>
              <ul className="space-y-1.5 text-xs text-slate-500">
                {[
                  "Use well-lit images with clear subjects",
                  "Images with multiple objects work great",
                  "Higher resolution → more accurate detections",
                  "YOLOv8 can detect 80 COCO object classes",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="mt-0.5 w-1 h-1 rounded-full bg-neural-500/60 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Right column ── */}
          <div ref={resultRef}>
            {loading ? (
              <div className="glass-strong rounded-2xl">
                <LoadingSpinner uploadProgress={uploadProgress} />
              </div>
            ) : result ? (
              <DetectionResult result={result} />
            ) : (
              <div className="glass rounded-2xl flex flex-col items-center justify-center
                              py-20 text-center border-dashed border-surface-500">
                <div className="w-14 h-14 rounded-2xl bg-surface-700/60 flex items-center
                                justify-center mb-4">
                  <Scan size={26} className="text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Results will appear here</p>
                <p className="text-slate-700 text-xs mt-1">Upload an image and click Detect</p>
              </div>
            )}
          </div>
        </div>

        {/* ── History ── */}
        <div className="mt-10">
          <HistoryPanel
            onSelect={handleHistorySelect}
            refreshTrigger={historyRefresh}
          />
        </div>

        {/* ── Footer ── */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-slate-700">
            NeuralEye · Django REST + YOLOv8 + React · Built with ♥
          </p>
        </footer>
      </div>
    </div>
  );
}
