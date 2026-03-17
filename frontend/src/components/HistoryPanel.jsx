import React, { useState, useEffect, useCallback } from "react";
import { History, Trash2, ChevronLeft, ChevronRight, RefreshCw, Eye } from "lucide-react";
import { fetchHistory, deleteRecord } from "../api/api";

export default function HistoryPanel({ onSelect, refreshTrigger }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const data = await fetchHistory(pg, 6);
      setRecords(data.results);
      setPage(pg);
      setTotalPages(data.total_pages || 1);
      setTotal(data.total);
    } catch (e) {
      console.error("History fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load, refreshTrigger]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this detection record?")) return;
    await deleteRecord(id);
    load(page);
  };

  if (total === 0 && !loading) return null;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-surface-600/50">
        <div className="flex items-center gap-2">
          <History size={14} className="text-neural-400" />
          <span className="section-heading">Detection History</span>
          <span className="badge bg-neural-600/20 text-neural-300 border border-neural-500/20 text-xs">
            {total}
          </span>
        </div>
        <button
          onClick={() => load(page)}
          disabled={loading}
          className="btn-ghost p-1.5"
          title="Refresh"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Records grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-surface-700/40 animate-pulse aspect-[4/3]" />
            ))
          : records.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelect && onSelect(rec)}
                className="group relative rounded-xl overflow-hidden cursor-pointer
                           border border-surface-600/40 hover:border-neural-500/50
                           transition-all duration-200 hover:scale-[1.02]"
              >
                {/* Thumbnail — result_image_url is now an absolute URL from backend */}
                {rec.result_image_url ? (
                  <img
                    src={rec.result_image_url}
                    alt={`Detection #${rec.id}`}
                    className="w-full aspect-[4/3] object-cover bg-surface-800"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] bg-surface-700 flex items-center justify-center">
                    <Eye size={20} className="text-slate-600" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/90 via-transparent to-transparent" />

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs font-semibold text-white leading-tight">
                    {rec.object_count} object{rec.object_count !== 1 ? "s" : ""}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {rec.unique_labels || "—"}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, rec.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-surface-900/80
                             text-slate-500 hover:text-danger-400
                             opacity-0 group-hover:opacity-100 transition-all duration-150"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pb-4">
          <button
            onClick={() => load(page - 1)}
            disabled={page === 1 || loading}
            className="btn-ghost p-1.5 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-slate-400 font-mono">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => load(page + 1)}
            disabled={page === totalPages || loading}
            className="btn-ghost p-1.5 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
