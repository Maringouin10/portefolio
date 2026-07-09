"use client";

import { useEffect } from "react";

export default function ModelViewer({ src, alt }: { src: string; alt: string }) {
  useEffect(() => {
    if (customElements.get("model-viewer")) return;
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    document.head.appendChild(script);
  }, []);

  return (
    <model-viewer
      src={src}
      alt={alt}
      camera-controls
      auto-rotate
      shadow-intensity="1"
      style={{ width: "100%", height: "420px", background: "#f5f5f5" }}
      className="border border-black/10"
    />
  );
}
