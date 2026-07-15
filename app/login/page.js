"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { navHrefFor } from "@/lib/data";
import Seal from "@/components/Seal";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
  e.preventDefault();
  setError("");
  setSubmitting(true);
  const result = await login(email.trim(), password);
  console.log("Login result:", result);
  setSubmitting(false);

  if (!result.ok) {
    setError(result.error);
    return;
  }

  const href = navHrefFor(result.user?.role);
  window.location.href = href; // hard nav — was: router.push(href)
}

  return (
    <div className="text-text min-h-screen flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-ink">
            <span className="text-brass">
              <Seal className="h-8 w-8" />
            </span>
            <span className="font-display font-semibold text-base">
              Ilé Surulere
            </span>
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-muted hover:text-ink"
          >
            Own property here? Register
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl text-ink font-semibold">
            Log in
          </h1>
          <p className="text-sm text-muted mt-2">
            For property owners, tenants, CDA members, and LG Staff.
          </p>

          <form
            onSubmit={handleSubmit}
            className="card card-body space-y-4 mt-5"
          >
            <div>
              <label className="field-label" htmlFor="email">
                Email address
              </label>
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
              <label className="field-label" htmlFor="password">
                Password
              </label>
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
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
