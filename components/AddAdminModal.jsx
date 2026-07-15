"use client";

import { useState } from "react";
import Modal from "./Modal";

export default function AddAdminModal({ open, onClose, onAdded }) {
  return (
    <Modal open={open} onClose={onClose} title="Add LG Staff member">
      <AdminForm key={open ? "open" : "closed"} onClose={onClose} onAdded={onAdded} />
    </Modal>
  );
}

function AdminForm({ onClose, onAdded }) {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", title: "", password: "", password2: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/create-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          title: form.title.trim() || undefined,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      onAdded?.();
      onClose();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted -mt-1">
        This creates a real login account. The new staff member can log in with the email and temporary
        password below and change it from their dashboard.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="adm-name">Full name <span className="text-flagged">*</span></label>
          <input className="field-input" id="adm-name" required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="adm-title">Title / role</label>
          <input className="field-input" id="adm-title" placeholder="e.g. LG Information Officer" value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="adm-email">Email <span className="text-flagged">*</span></label>
          <input className="field-input" id="adm-email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="adm-phone">Phone</label>
          <input className="field-input" id="adm-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="adm-pw">Temporary password <span className="text-flagged">*</span></label>
          <input className="field-input" id="adm-pw" type="password" minLength={6} required value={form.password} onChange={(e) => set("password", e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="adm-pw2">Confirm password <span className="text-flagged">*</span></label>
          <input className="field-input" id="adm-pw2" type="password" minLength={6} required value={form.password2} onChange={(e) => set("password2", e.target.value)} />
        </div>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="flex gap-2.5 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary flex-1">
          {submitting ? "Creating account…" : "Add staff member"}
        </button>
      </div>
    </form>
  );
}