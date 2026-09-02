"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { navHrefFor } from "@/lib/data";

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
    <div className="text-text min-h-screen flex">
      <div
        className="hero-panel hidden lg:flex lg:w-[42%] lg:flex-col lg:justify-end lg:p-10"
        style={{ backgroundImage: "url(/illustrations/estate-panel.svg)" }}
      >
        <div className="flex items-center gap-2.5 text-on-ink mb-6">
          <span className="relative h-8 w-8 rounded-full overflow-hidden shrink-0">
            <Image src="/logo.jpeg" alt="Surulere Local Government seal" fill sizes="32px" className="object-cover" />
          </span>
          <span className="font-display font-semibold text-base">Ilé Surulere</span>
        </div>
        <p className="font-display text-2xl text-on-ink leading-snug max-w-sm">
          One record for every home in Surulere.
        </p>
        <p className="text-sm text-on-ink/75 mt-3 max-w-sm">
          Owners, tenants, CDA members, and LG Staff — each with their own gate,
          into the same trusted registry.
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-line lg:hidden">
          <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
            <Link href="/registry" className="flex items-center gap-2.5 text-ink">
              <span className="relative h-8 w-8 rounded-full overflow-hidden shrink-0">
                <Image src="/logo.jpeg" alt="Surulere Local Government seal" fill sizes="32px" className="object-cover" />
              </span>
              <span className="font-display font-semibold text-base">
                Ilé Surulere
              </span>
            </Link>
            <Link
              href="/registry/signup"
              className="text-sm font-medium text-muted hover:text-ink"
            >
              Own property here? Register
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-sm">
            <Link href="/registry/signup" className="hidden lg:block text-sm font-medium text-muted hover:text-ink mb-6">
              Own property here? Register &rarr;
            </Link>
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
    </div>
  );
}
