"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SetupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de la creation du compte");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm border border-white/20 p-8">
      <h1 className="text-xl font-bold uppercase tracking-widest mb-2">Bienvenue</h1>
      <p className="text-sm text-white/60 mb-6">
        Premier demarrage : creez votre compte administrateur. Le mot de passe sera hache et
        enregistre automatiquement.
      </p>

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

      <div className="mb-4">
        <label className="block text-xs uppercase tracking-widest mb-2">Mot de passe</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent border border-white/30 px-3 py-2 focus:outline-none focus:border-white"
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs uppercase tracking-widest mb-2">Confirmer le mot de passe</label>
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full bg-transparent border border-white/30 px-3 py-2 focus:outline-none focus:border-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full border border-white px-4 py-2.5 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
      >
        {loading ? "Creation..." : "Creer le compte"}
      </button>
    </form>
  );
}
