"use client";

import { useState } from "react";
import Modal from "./Modal";
import { DB, WARDS, emailTaken, addAuditEntry } from "@/lib/data";

export default function AddCdaModal({ open, onClose, addedBy }) {
  return (
    <Modal open={open} onClose={onClose} title="Add a CDA member">
      <CdaForm key={open ? "open" : "closed"} addedBy={addedBy} onClose={onClose} />
    </Modal>
  );
}

function CdaForm({ addedBy, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wardId, setWardId] = useState(WARDS[0]?.id || "");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const db = DB.load();
    if (emailTaken(db, email.trim())) {
      setError("An account already exists with that email.");
      return;
    }
    if (!wardId) {
      setError("Assign a ward.");
      return;
    }

    db.users.push({
      id: "u-cda-" + Date.now(),
      role: "cda",
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: "demo1234",
      ward_id: wardId,
      addedBy,
    });
    addAuditEntry(db, {
      actorId: addedBy, action: "Added a CDA member",
      detail: `${name.trim()} — ${WARDS.find((w) => w.id === wardId)?.name}`,
    });
    DB.save(db); // notifies the store
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="cda-name">Full name</label>
        <input className="field-input" id="cda-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="cda-email">Email</label>
          <input className="field-input" id="cda-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="cda-phone">Phone</label>
          <input className="field-input" id="cda-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="cda-ward">Assign ward</label>
        <select className="field-input" id="cda-ward" value={wardId} onChange={(e) => setWardId(e.target.value)}>
          {WARDS.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <span className="field-hint">They&rsquo;ll see every property registered in this ward, across all CDAs in it.</span>
      </div>
      {error && <p className="field-error">{error}</p>}
      <p className="field-hint -mt-1">They&rsquo;ll log in with this email and the default password <span className="font-mono">demo1234</span>.</p>
      <div className="flex gap-2.5 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1">Add CDA member</button>
      </div>
    </form>
  );
}