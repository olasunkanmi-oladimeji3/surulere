// components/AddCdaModal.js
"use client";
import { useState, useTransition } from "react";
import Modal from "./Modal";
import { createCdaMemberAction } from "@/app/registry/dashboard/admin/cda-members/actions";

export default function AddCdaModal({ open, onClose, wards }) {
  const [credentials, setCredentials] = useState(null);

  function handleClose() {
    setCredentials(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={credentials ? "CDA member added" : "Add a CDA member"}>
      {credentials ? (
        <CredentialsScreen credentials={credentials} onDone={handleClose} />
      ) : (
        <MemberForm key={open ? "open" : "closed"} wards={wards} onClose={handleClose} onCreated={setCredentials} />
      )}
    </Modal>
  );
}

function MemberForm({ wards, onClose, onCreated }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wardId, setWardId] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await createCdaMemberAction({ fullName, email, phone, wardId });
      if (!res.ok) { setError(res.error); return; }
      onCreated(res.credentials);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="cda-name">Full name</label>
        <input className="field-input" id="cda-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <label className="field-label" htmlFor="cda-email">Email</label>
        <input className="field-input" id="cda-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="field-label" htmlFor="cda-phone">Phone</label>
        <input className="field-input" id="cda-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label className="field-label" htmlFor="cda-ward">Ward</label>
        <select className="field-input" id="cda-ward" required value={wardId} onChange={(e) => setWardId(e.target.value)}>
          <option value="">Select a ward</option>
          {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>
      {error && <p className="field-error">{error}</p>}
      <div className="flex gap-2.5 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={pending} className="btn-primary flex-1">{pending ? "Creating…" : "Add member"}</button>
      </div>
    </form>
  );
}

function CredentialsScreen({ credentials, onDone }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Share these sign-in details with <strong>{credentials.name}</strong> yourself — this demo can&rsquo;t send real email, so nothing was sent automatically. They should change the password after first login.
      </p>
      <div className="card bg-paper card-body space-y-2">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">Email</p>
          <p className="text-sm font-mono text-ink">{credentials.email}</p>
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">Temporary password</p>
          <p className="text-sm font-mono text-ink">{credentials.password}</p>
        </div>
      </div>
      <button onClick={onDone} className="btn-primary w-full">Done</button>
    </div>
  );
}