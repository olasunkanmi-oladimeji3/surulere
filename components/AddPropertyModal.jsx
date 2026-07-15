"use client";

import { useState } from "react";
import Modal from "./Modal";
import PropertyFieldsSection, { initialPropertyForm } from "./forms/PropertyFieldsSection";
import { useAuth } from "@/contexts/AuthContext";
import { addProperty } from "@/lib/supabaseData";

export default function AddPropertyModal({ open, onClose, ownerId, onAdded }) {
  return (
    <Modal open={open} onClose={onClose} title="Add a property" size="lg">
      <PropertyForm key={open ? "open" : "closed"} ownerId={ownerId} onClose={onClose} onAdded={onAdded} />
    </Modal>
  );
}

function PropertyForm({ ownerId, onClose, onAdded }) {
  const { supabase } = useAuth();
  const [form, setForm] = useState(initialPropertyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function setField(name, value) {
    setForm((f) => {
      const next = { ...f, [name]: value };
      if (name === "wardId") next.cdaId = "";
      if (name === "propertyType" && value !== "rented") next.unitTenancyType = "";
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const unitSpecs = Array.from({ length: form.unitCount }, () => ({
      occupancyType: form.unitOccupancyType,
      tenancyType: form.unitTenancyType,
    }));

    const result = await addProperty(supabase, {
      ownerId,
      address: form.address,
      wardId: form.wardId,
      cdaId: form.cdaId,
      buildingType: form.buildingType,
      propertyType: form.propertyType,
      unitSpecs,
      staff: form.hasDomesticStaff ? form.domesticStaff : [],
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onAdded?.();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PropertyFieldsSection form={form} setField={setField} setForm={setForm} />
      {error && <p className="field-error">{error}</p>}
      <div className="flex gap-2.5 pt-2 border-t border-line">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary flex-1">
          {submitting ? "Adding…" : "Add property"}
        </button>
      </div>
    </form>
  );
}