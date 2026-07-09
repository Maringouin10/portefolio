"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur de connexion");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm border border-white/20 p-8">
      <h1 className="text-xl font-bold uppercase tracking-widest mb-6">Connexion admin</h1>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <div className="mb-4">
        <label className="block text-xs uppercase tracking-widest mb-2">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent border border-white/30 px-3 py-2 focus:outline-none focus:border-white"
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs uppercase tracking-widest mb-2">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent border border-white/30 px-3 py-2 focus:outline-none focus:border-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full border border-white px-4 py-2.5 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
