"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function BackofficeLoginPage() {
  const { login, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    // This app is LG Staff only — reject and sign out anyone else who
    // authenticates correctly but isn't an admin, rather than let them into
    // a dashboard with no matching nav for their role.
    if (result.user?.role !== "admin") {
      await logout();
      setError("This backoffice is for LG Staff accounts only.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <div className="text-text min-h-screen flex items-center justify-center px-5 bg-paper">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <span className="pill-ink text-xs">LG Staff backoffice</span>
          <h1 className="font-display text-2xl text-ink font-semibold mt-3">Log in</h1>
          <p className="text-sm text-muted mt-2">Internal access only.</p>
        </div>

        <form onSubmit={handleSubmit} className="card card-body space-y-4">
          <div>
            <label className="field-label" htmlFor="email">Email address</label>
            <input
              className="field-input"
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input
              className="field-input"
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
