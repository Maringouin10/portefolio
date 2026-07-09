"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProjectButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Supprimer definitivement "${title}" ?`)) return;
    setLoading(true);
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      alert("Erreur lors de la suppression");
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="hover:underline disabled:opacity-50">
      {loading ? "Suppression..." : "Supprimer"}
    </button>
  );
}
