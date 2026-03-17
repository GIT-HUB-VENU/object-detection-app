import React, { useState } from "react";
import { Download, ZoomIn, X, Tag, BarChart2, Clock, Layers } from "lucide-react";
import { BASE_URL } from "../api/api";

// ── Label colour palette (matches backend OpenCV palette) ────────────────────
const LABEL_COLORS = [
  "#ff3838","#ff9d33","#ffe138","#38ff7a","#38c4ff",
  "#3838ff","#c538ff","#ff3885","#48ff48","#ffff48",
  "#48ffff","#ff48ff",
];
const colorForLabel = (label) => {
  let hash = 0;
  for (let c of label) hash = (hash << 5) - hash + c.charCodeAt(0);
  return LABEL_COLORS[Math.abs(hash) % LABEL_COLORS.length];
};

// ── Confidence badge colour ───────────────────────────────────────────────────
const confColor = (conf) => {
  if (conf >= 0.8) return "text-accent-400 bg-accent-500/10 border-accent-500/30";
  if (conf >= 0.5) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  return "text-orange-400 bg-orange-500/10 border-orange-500/30";
};

// ── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-surface-700 text-slate-300 hover:text-white"
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt="Fullscreen result"
        className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ── Summary chips ─────────────────────────────────────────────────────────────
function SummaryChip({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 rounded-xl bg-surface-700/50 border border-surface-600/50">
      <div className={`flex items-center gap-1.5 text-xs font-medium ${accent || "text-slate-400"}`}>
        <Icon size={12} />
        <span>{label}</span>
      </div>
      <span className="text-xl font-bold text-white font-mono">{value}</span>
    </div>
  );
}

export default function DetectionResult({ result }) {
  const [lightbox, setLightbox] = useState(false);

  if (!result) return null;

  const {
    detections = [],
    result_image,
    result_image_is_absolute,
    object_count,
    unique_labels = [],
    processing_time_ms,
  } = result;

  // If the URL is already absolute (from history), use it directly.
  // Otherwise prepend BASE_URL (from /api/detect/ response).
  const imageUrl = result_image_is_absolute
    ? result_image
    : `${BASE_URL}${result_image}`;

  // Aggregate counts per label
  const labelCounts = detections.reduce((acc, d) => {
    acc[d.label] = (acc[d.label] || 0) + 1;
    return acc;
  }, {});

  // Sort detections by confidence descending
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);

  const handleDownload = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `detection_result_${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed:", e);
    }
  };

  return (
    <>
      {lightbox && <Lightbox src={imageUrl} onClose={() => setLightbox(false)} />}

      <div className="animate-slide-up space-y-6">
        {/* ── Result image ── */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-surface-600/50">
            <span className="section-heading">Detection Result</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightbox(true)}
                className="btn-ghost text-xs py-1.5 px-3"
              >
                <ZoomIn size={13} /> Zoom
              </button>
              <button onClick={handleDownload} className="btn-ghost text-xs py-1.5 px-3">
                <Download size={13} /> Save
              </button>
            </div>
          </div>
          <div className="p-4 bg-surface-900/60">
            <img
              src={imageUrl}
              alt="Detection result"
              className="w-full rounded-xl object-contain max-h-96 cursor-zoom-in"
              onClick={() => setLightbox(true)}
            />
          </div>
        </div>

        {/* ── Summary chips ── */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryChip icon={Layers}    label="Objects"    value={object_count}                          accent="text-neural-400" />
          <SummaryChip icon={Tag}       label="Categories" value={unique_labels.length}                  accent="text-accent-400" />
          <SummaryChip icon={Clock}     label="Time (ms)"  value={processing_time_ms?.toFixed(0) ?? "—"} accent="text-yellow-400" />
        </div>

        {/* ── Label summary ── */}
        {unique_labels.length > 0 && (
          <div className="glass rounded-2xl p-5">
            <p className="section-heading mb-3">Detected Categories</p>
            <div className="flex flex-wrap gap-2">
              {unique_labels.map((lbl) => (
                <span
                  key={lbl}
                  className="badge border px-3 py-1 text-sm font-semibold"
                  style={{
                    color: colorForLabel(lbl),
                    borderColor: `${colorForLabel(lbl)}55`,
                    background: `${colorForLabel(lbl)}12`,
                  }}
                >
                  {lbl}
                  {labelCounts[lbl] > 1 && (
                    <span className="ml-1.5 opacity-70">×{labelCounts[lbl]}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Per-detection list ── */}
        {sorted.length > 0 ? (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-600/50 flex items-center justify-between">
              <span className="section-heading">All Detections</span>
              <div className="flex items-center gap-1.5">
                <BarChart2 size={13} className="text-neural-400" />
                <span className="text-xs text-neural-400 font-medium">{sorted.length} objects</span>
              </div>
            </div>
            <div className="divide-y divide-surface-600/30 max-h-80 overflow-y-auto">
              {sorted.map((det, i) => {
                const pct = Math.round(det.confidence * 100);
                const color = colorForLabel(det.label);
                return (
                  <div key={i} className="px-5 py-3 hover:bg-surface-700/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: color }}
                        />
                        <span className="text-sm font-semibold text-slate-200 capitalize">
                          {det.label}
                        </span>
                      </div>
                      <span className={`badge border text-xs font-bold font-mono ${confColor(det.confidence)}`}>
                        {pct}%
                      </span>
                    </div>
                    {/* Confidence bar */}
                    <div className="h-1.5 rounded-full bg-surface-600/60 overflow-hidden">
                      <div
                        className="h-full rounded-full conf-bar"
                        style={{
                          "--pct": `${pct}%`,
                          background: `linear-gradient(90deg, ${color}99, ${color})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-slate-400 text-sm">No objects detected in this image.</p>
            <p className="text-slate-600 text-xs mt-1">Try a different image with clearer subjects.</p>
          </div>
        )}
      </div>
    </>
  );
}
