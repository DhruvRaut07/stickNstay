"use client";

import { useEffect } from "react";

/** Replaces the root layout when it crashes, so it carries its own html/body and inline styles. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("Global error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#FFF6E9",
          color: "#1B1B2F",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, margin: "0 0 8px" }}>Something went wrong.</h1>
          <p style={{ margin: "0 0 24px", color: "#5A6275" }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              height: 48,
              padding: "0 28px",
              borderRadius: 999,
              border: 0,
              background: "#FFD45C",
              color: "#1B1B2F",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
