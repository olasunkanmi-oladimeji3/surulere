"use client";

import { useState } from "react";
import Modal from "./Modal";
import { DB, addAuditEntry } from "@/lib/data";

export default function LogVisitModal({ open, onClose, propertyId, actorId, actionLabel }) {
  return (
    <Modal open={open} onClose={onClose} title="Log a verification visit">
      <VisitForm key={open ? "open" : "closed"} propertyId={propertyId} actorId={actorId} onClose={onClose} actionLabel={actionLabel} />
    </Modal>
  );
}

function VisitForm({ propertyId, actorId, onClose, actionLabel }) {
  const [outcome, setOutcome] = useState("verified");
  const [note, setNote] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const db = DB.load();
    const property = db.properties.find((p) => p.id === propertyId);
    property.status = outcome;
    property.flagNote = outcome === "flagged" ? note.trim() : undefined;
    property.updated_at = new Date().toISOString().slice(0, 10);

    db.verificationLogs.push({
      id: "log-" + Date.now(),
      property_id: propertyId,
      actorId,
      outcome,
      note: note.trim(),
      date: new Date().toISOString().slice(0, 10),
    });

    addAuditEntry(db, {
      actorId, action: outcome === "verified" ? "Verified a property" : "Flagged a property",
      detail: `${property.property_number} — ${note.trim()}`,
    });
    DB.save(db); // notifies the store
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span className="field-label">What did you find?</span>
        <div className="flex gap-2.5">
          <label className={`flex-1 card card-body py-2.5 cursor-pointer flex items-center gap-2 ${outcome === "verified" ? "border-verified bg-verified-tint" : ""}`}>
            <input type="radio" name="outcome" value="verified" checked={outcome === "verified"} onChange={() => setOutcome("verified")} />
            <span className="text-sm">Matches — verify it</span>
          </label>
          <label className={`flex-1 card card-body py-2.5 cursor-pointer flex items-center gap-2 ${outcome === "flagged" ? "border-flagged bg-flagged-tint" : ""}`}>
            <input type="radio" name="outcome" value="flagged" checked={outcome === "flagged"} onChange={() => setOutcome("flagged")} />
            <span className="text-sm">Doesn&rsquo;t match — flag it</span>
          </label>
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="visit-note">Note</label>
        <textarea
          className="field-input" id="visit-note" rows={3} placeholder="What you saw on site" required
          value={note} onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="flex gap-2.5 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1">{actionLabel || "Submit"}</button>
      </div>
    </form>
  );
}