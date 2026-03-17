import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000, // 2 min — YOLO can take a moment on first cold run
});

// ── Request interceptor: log outgoing ────────────────────────────────────────
client.interceptors.request.use((config) => {
  console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// ── Response interceptor: normalise errors ───────────────────────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.details ||
      err.message ||
      "Unknown error";
    return Promise.reject(new Error(message));
  }
);

/**
 * POST /api/detect/
 * @param {File} imageFile
 * @param {(pct: number) => void} onProgress
 */
export const detectObjects = async (imageFile, onProgress) => {
  const form = new FormData();
  form.append("image", imageFile);

  const { data } = await client.post("/api/detect/", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return data;
};

/**
 * GET /api/history/
 * @param {number} page
 * @param {number} pageSize
 */
export const fetchHistory = async (page = 1, pageSize = 10) => {
  const { data } = await client.get("/api/history/", {
    params: { page, page_size: pageSize },
  });
  return data;
};

/**
 * DELETE /api/history/:id/
 */
export const deleteRecord = async (id) => {
  const { data } = await client.delete(`/api/history/${id}/`);
  return data;
};

/**
 * GET /api/health/
 */
export const checkHealth = async () => {
  const { data } = await client.get("/api/health/");
  return data;
};

export { BASE_URL };
