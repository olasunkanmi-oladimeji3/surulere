"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Pill from "@/components/Pill";
import { TextField } from "@/components/forms/fieldKit";

export default function SignupPage() {
  const { registerOwner } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", phone: "", nin: "", email: "", password: "", password2: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.password2) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const result = await registerOwner({
      fullName: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
      password: form.password, nin: form.nin.trim(),
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (!result.session) {
      // Supabase project has "Confirm email" on — no session yet.
      setCheckEmail(true);
      return;
    }
    router.push("/registry/dashboard/owner");
  }

  if (checkEmail) {
    return (
      <div className="text-text min-h-screen flex items-center justify-center px-5">
        <div className="card card-body max-w-md text-center py-10">
          <h1 className="font-display text-xl text-ink font-semibold">Check your email</h1>
          <p className="text-sm text-muted mt-2">
            We sent a confirmation link to <strong>{form.email}</strong>. Click it, then log in.
          </p>
          <Link href="/registry/login" className="btn-primary mt-6 inline-block">Go to login</Link>
        </div>
      </div>
    );
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
          Bring your property through the gate.
        </p>
        <p className="text-sm text-on-ink/75 mt-3 max-w-sm">
          List it once, keep it current, and let your CDA and the Local
          Government verify it on the ground.
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-line lg:hidden">
          <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
            <Link href="/registry" className="flex items-center gap-2.5 text-ink">
              <span className="relative h-8 w-8 rounded-full overflow-hidden shrink-0">
                <Image src="/logo.jpeg" alt="Surulere Local Government seal" fill sizes="32px" className="object-cover" />
              </span>
              <span className="font-display font-semibold text-base">Ilé Surulere</span>
            </Link>
            <Link href="/registry/login" className="text-sm font-medium text-muted hover:text-ink">
              Already have an account? Log in
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-md">
            <Link href="/registry/login" className="hidden lg:block text-sm font-medium text-muted hover:text-ink mb-6">
              Already have an account? Log in &rarr;
            </Link>
            <div className="text-center mb-7">
              <Pill variant="brass">Property owner</Pill>
              <h1 className="font-display text-2xl text-ink font-semibold mt-3">Register as a property owner</h1>
              <p className="text-sm text-muted mt-2">
                Add your properties and tenants once you&rsquo;re in. Tenants don&rsquo;t sign up
                themselves — you&rsquo;ll add them, and they&rsquo;ll get their own login by email.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="card card-body space-y-4">
            <TextField label="Full name" required value={form.name} onChange={(v) => set("name", v)} placeholder="e.g. Ronke Afolabi" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField label="Phone number" type="tel" required value={form.phone} onChange={(v) => set("phone", v)} placeholder="0800 000 0000" />
              <TextField label="NIN" required mono maxLength={11} inputMode="numeric" value={form.nin} onChange={(v) => set("nin", v)} placeholder="11 digits" />
            </div>
            <TextField label="Email address" type="email" required value={form.email} onChange={(v) => set("email", v)} placeholder="you@example.com" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField label="Password" type="password" required minLength={6} value={form.password} onChange={(v) => set("password", v)} />
              <TextField label="Confirm password" type="password" required minLength={6} value={form.password2} onChange={(v) => set("password2", v)} />
            </div>
            {error && <p className="field-error">{error}</p>}
            <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
              {submitting ? "Creating your account…" : "Create my account"}
            </button>
            <p className="text-xs text-muted text-center pt-1">
              CDA members and LG Staff don&rsquo;t sign up here either — those accounts are issued by LG Staff directly.
            </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}