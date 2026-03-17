import React from "react";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a27",
            color: "#e2e8f0",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "12px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "13px",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#1a1a27" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#1a1a27" },
          },
        }}
      />
      <Home />
    </>
  );
}
