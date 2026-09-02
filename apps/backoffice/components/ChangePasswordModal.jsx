"use client";

import { useState } from "react";
import Modal from "./Modal";
import { useAuth } from "@/contexts/AuthContext";

export default function ChangePasswordModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Change your password">
      <PasswordForm key={open ? "open" : "closed"} onClose={onClose} />
    </Modal>
  );
}

function PasswordForm({ onClose }) {
  const { user, changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }
    const result = changePassword(user.id, current, next);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="text-center py-2">
        <p className="text-sm text-ink font-medium">Password updated.</p>
        <p className="text-sm text-muted mt-1">Use your new password next time you log in.</p>
        <button onClick={onClose} className="btn-primary mt-4">Done</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted -mt-1">
        If you logged in with a temporary password from a welcome email, this is where you set your own.
      </p>
      <div>
        <label className="field-label" htmlFor="cp-current">Current password</label>
        <input className="field-input" id="cp-current" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="cp-new">New password</label>
          <input className="field-input" id="cp-new" type="password" minLength={6} required value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="cp-confirm">Confirm new password</label>
          <input className="field-input" id="cp-confirm" type="password" minLength={6} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="flex gap-2.5 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1">Update password</button>
      </div>
    </form>
  );
}
