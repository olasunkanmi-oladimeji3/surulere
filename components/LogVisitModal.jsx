// components/LogVisitModal.js
"use client";
import { useState, useTransition } from "react";
import Modal from "./Modal";
import { logVisitAction } from "@/app/dashboard/admin/properties/[id]/actions";

export default function LogVisitModal({ open, onClose, propertyId, actionLabel }) {
  return (
    <Modal open={open} onClose={onClose} title="Log a verification visit">
      <VisitForm key={open ? "open" : "closed"} propertyId={propertyId} onClose={onClose} actionLabel={actionLabel} />
    </Modal>
  );
}

function VisitForm({ propertyId, onClose, actionLabel }) {
  const [outcome, setOutcome] = useState("verified");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await logVisitAction(propertyId, outcome, note);
      if (!res.ok) { setError(res.error); return; }
      onClose();
    });
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
      {error && <p className="field-error">{error}</p>}
      <div className="flex gap-2.5 pt-1">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={pending} className="btn-primary flex-1">{pending ? "Saving…" : (actionLabel || "Submit")}</button>
      </div>
    </form>
  );
}