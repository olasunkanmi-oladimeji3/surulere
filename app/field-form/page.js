"use client";

import { useState, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import { createClient } from "@/lib/supabase/cilent";
import Seal from "@/components/Seal";
import Icon from "@/components/Icon";
import Stamp from "@/components/Stamp";
import Image from "next/image";

// ─── Supabase client (anon key — wards/cdas are public) ─────────────────────
const supabase = createClient();


async function fetchWards() {
  const { data, error } = await supabase.from("wards").select("id, name, code").order("name");
  if (error) throw error;
  return data;
}
async function fetchCdas(wardId) {
  const { data, error } = await supabase.from("cdas").select("id, name").eq("ward_id", wardId).order("name");
  if (error) throw error;
  return data;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const BUILDING_TYPES = [
  { value: "bungalow",        label: "Bungalow" },
  { value: "1_storey",        label: "1 Storey Building" },
  { value: "2_storey",        label: "2 Storey Building" },
  { value: "3_storey",        label: "3 Storey Building" },
  { value: "5_storey",        label: "5 Storey Building" },
  { value: "5_to_12_storey",  label: "5 to 12 Storey Building" },
];
const PROPERTY_TYPES = [
  { value: "rented",           label: "Rented" },
  { value: "private_joint",    label: "Private / Joint" },
  { value: "family_house",     label: "Family House" },
  { value: "private_personal", label: "Private Personal" },
];
const GENDERS        = ["Male", "Female", "Other"];
const MARITAL        = ["Single", "Married", "Divorced", "Widowed", "Separated"];
const RELATIONSHIPS  = ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Other relative", "Other"];
const STATES         = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT (Abuja)","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

const STEPS = ["CDA Info", "Property", "Residents", "Review"];

const emptyResident = () => ({
  firstName: "", lastName: "", phone: "", email: "", nin: "",
  dateOfBirth: "", gender: "", maritalStatus: "", stateOfOrigin: "",
  occupation: "", isHead: false, unitDescription: "",
  householdMembers: [],
});
const emptyMember = () => ({
  firstName: "", lastName: "", relationship: "", age: "", gender: "", nin: "",
});

// ─── Image compression ───────────────────────────────────────────────────────
async function compressImage(file, maxPx = 1200, quality = 0.78) {
  return new Promise((resolve) => {
    const img = new window.Image(); // was: new Image()
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}
// ─── Main component ──────────────────────────────────────────────────────────
export default function FieldFormPage() {
  const [step, setStep]           = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]       = useState(null);
  const [globalError, setGlobalError] = useState("");

  // Step 1 — CDA info
  const [wardId, setWardId]       = useState("");
  const [cdaId, setCdaId]         = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentPhone, setAgentPhone] = useState("");

  // Step 2 — Property
  const [address, setAddress]         = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName]   = useState("");
  const [ownerPhone, setOwnerPhone]     = useState("");
  const [ownerNin, setOwnerNin]         = useState("");
  const [images, setImages]             = useState([]); // { file, previewUrl, compressed }

  // Step 3 — Residents
  const [residents, setResidents] = useState([emptyResident()]);

  // Step errors
  const [errors, setErrors] = useState({});

  // SWR — public reads, no auth needed
  const { data: wards }   = useSWR("field-wards", fetchWards);
  const { data: cdaList } = useSWR(wardId ? ["field-cdas", wardId] : null, () => fetchCdas(wardId));

  // ── Validation ──────────────────────────────────────────────────────────
 function validateStep(s) {
  const e = {};

  if (s === 0) {
    if (!wardId) {
      e.wardId = "Select a ward.";
    }

    if (!cdaId) {
      e.cdaId = "Select a CDA.";
    }

    if (!agentName?.trim()) {
      e.agentName = "Enter your full name.";
    }

    if (!agentPhone?.trim()) {
      e.agentPhone = "Enter your phone number.";
    } else if (!isValidNigerianPhone(agentPhone)) {
      e.agentPhone =
        "Enter a valid phone number (e.g. 0803 123 4567).";
    }
  }

  if (s === 1) {
    if (!address?.trim()) {
      e.address = "Enter the property address.";
    }

    if (!buildingType) {
      e.buildingType = "Select building type.";
    }

    if (!propertyType) {
      e.propertyType = "Select property type.";
    }

    if (!ownerFirstName?.trim()) {
      e.ownerFirstName = "Enter owner's first name.";
    }

    if (!ownerLastName?.trim()) {
      e.ownerLastName = "Enter owner's last name.";
    }

    if (!ownerPhone?.trim()) {
      e.ownerPhone = "Enter owner's phone number.";
    } else if (!isValidNigerianPhone(ownerPhone)) {
      e.ownerPhone =
        "Enter a valid phone number (e.g. 0803 123 4567).";
    }

    if (
      ownerNin &&
      ownerNin.replace(/\D/g, "").length !== 11
    ) {
      e.ownerNin = "NIN must be exactly 11 digits.";
    }
  }

  if (s === 2) {
    residents.forEach((r, i) => {
      if (!r.firstName?.trim()) {
        e[`r${i}_firstName`] = "First name required.";
      }

      if (!r.lastName?.trim()) {
        e[`r${i}_lastName`] = "Last name required.";
      }

      if (!r.phone?.trim()) {
        e[`r${i}_phone`] = "Phone number required.";
      } else if (!isValidNigerianPhone(r.phone)) {
        e[`r${i}_phone`] =
          "Enter a valid phone number (e.g. 0803 123 4567).";
      }

      if (
        r.email?.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim())
      ) {
        e[`r${i}_email`] =
          "Enter a valid email or leave it blank.";
      }

      if (
        r.nin &&
        r.nin.replace(/\D/g, "").length !== 11
      ) {
        e[`r${i}_nin`] = "NIN must be exactly 11 digits.";
      }

      r.householdMembers.forEach((m, mi) => {
        if (!m.firstName?.trim()) {
          e[`r${i}_m${mi}_firstName`] = "First name required.";
        }

        if (!m.lastName?.trim()) {
          e[`r${i}_m${mi}_lastName`] = "Last name required.";
        }

        if (!m.relationship) {
          e[`r${i}_m${mi}_rel`] = "Relationship required.";
        }
      });
    });

    if (!residents.some((r) => r.isHead)) {
      e.headMissing =
        "Mark at least one resident as head of household.";
    }
  }

  setErrors(e);

  return Object.keys(e).length === 0;
}

function isValidNigerianPhone(value) {
  if (!value) return false;

  // Remove spaces, hyphens, brackets, etc.
  const digits = value.replace(/\D/g, "");

  // Accept:
  // 08031234567
  // 2348031234567
  // +2348031234567
  return (
    /^0\d{10}$/.test(digits) ||
    /^234\d{10}$/.test(digits)
  );
}

  function next() {
    if (validateStep(step)) setStep((s) => s + 1);
  }
  function back() { setStep((s) => s - 1); setErrors({}); }

  // ── Image handling ──────────────────────────────────────────────────────
  async function handleImageFiles(files) {
    const added = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const compressed = await compressImage(file);
      const previewUrl = URL.createObjectURL(compressed);
      added.push({ file, compressed, previewUrl,
        label: `${Math.round(compressed.size / 1024)} KB` });
    }
    setImages((prev) => [...prev, ...added]);
  }
  function removeImage(i) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].previewUrl);
      return prev.filter((_, idx) => idx !== i);
    });
  }

  // ── Resident helpers ────────────────────────────────────────────────────
  function setRes(i, field, value) {
    setResidents((prev) => {
      const next = prev.slice();
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }
  function setHead(i) {
    setResidents((prev) => prev.map((r, idx) => ({ ...r, isHead: idx === i })));
  }
  function addResident() {
    setResidents((prev) => [...prev, emptyResident()]);
  }
  function removeResident(i) {
    setResidents((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      if (!next.some((r) => r.isHead) && next.length > 0) next[0].isHead = true;
      return next;
    });
  }
  function addMember(ri) {
    setResidents((prev) => {
      const next = prev.slice();
      next[ri] = { ...next[ri], householdMembers: [...next[ri].householdMembers, emptyMember()] };
      return next;
    });
  }
  function setMember(ri, mi, field, value) {
    setResidents((prev) => {
      const next = prev.slice();
      const members = next[ri].householdMembers.slice();
      members[mi] = { ...members[mi], [field]: value };
      next[ri] = { ...next[ri], householdMembers: members };
      return next;
    });
  }
  function removeMember(ri, mi) {
    setResidents((prev) => {
      const next = prev.slice();
      next[ri] = { ...next[ri], householdMembers: next[ri].householdMembers.filter((_, idx) => idx !== mi) };
      return next;
    });
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validateStep(2)) return;
    setSubmitting(true);
    setGlobalError("");
    try {
      // Upload images first
      const imageUrls = [];
      for (const img of images) {
        const fd = new FormData();
        fd.append("file", img.compressed, "photo.jpg");
        const res = await fetch("/api/field/upload-image", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Image upload failed.");
        imageUrls.push(data.url);
      }

      // Submit form data
      const res = await fetch("/api/field/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName, agentPhone, wardId, cdaId,
          address, buildingType, propertyType,
          ownerFirstName, ownerLastName, ownerPhone,
          ownerNin: ownerNin.replace(/\D/g, "") || null,
          imageUrls,
          residents: residents.map((r) => ({
            firstName: r.firstName, lastName: r.lastName,
            phone: r.phone, email: r.email || null,
            nin: r.nin.replace(/\D/g, "") || null,
            dateOfBirth: r.dateOfBirth || null,
            gender: r.gender.toLowerCase() || null,
            maritalStatus: r.maritalStatus || null,
            stateOfOrigin: r.stateOfOrigin || null,
            occupation: r.occupation || null,
            isHead: r.isHead,
            unitDescription: r.unitDescription || null,
            householdMembers: r.householdMembers.map((m) => ({
              firstName: m.firstName, lastName: m.lastName,
              relationship: m.relationship,
              age: m.age ? Number(m.age) : null,
              gender: m.gender.toLowerCase() || null,
              nin: m.nin.replace(/\D/g, "") || null,
            })),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Submission failed.");
      setResult(data);
      setStep(4);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ───────────────────────────────────────────────────────
  if (step === 4 && result) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-5 py-12">
        <div className="card w-full max-w-md card-body text-center py-10">
          <div className="mx-auto h-14 w-14 rounded-full bg-verified-tint border border-verified/40 flex items-center justify-center text-verified mb-4">
            <Icon name="check" className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl text-ink font-semibold">Submitted!</h1>
          <p className="text-sm text-muted mt-2">
            Keep these reference numbers — LG Staff will use them to verify this submission.
          </p>
          <div className="card bg-paper mt-6 card-body text-left space-y-3">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Property reference</p>
              <p className="font-mono font-medium text-ink mt-0.5">{result.propertyNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Resident references</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.residentRefs.map((ref) => (
                  <span key={ref} className="stamp stamp-pending">{ref}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide">Submitted by</p>
              <p className="text-sm text-ink mt-0.5">{agentName}</p>
            </div>
          </div>
          <button
            onClick={() => { setStep(0); setResult(null); setImages([]); setResidents([emptyResident()]); setWardId(""); setCdaId(""); setAgentName(""); setAgentPhone(""); setAddress(""); setBuildingType(""); setPropertyType(""); setOwnerFirstName(""); setOwnerLastName(""); setOwnerPhone(""); setOwnerNin(""); }}
            className="btn-primary mt-6 w-full"
          >
            Submit another property
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="bg-ink text-on-ink">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          <span className="text-brass"> <Image src="/logo.png" alt="Ilé Surulere" width={32} height={32} /></span>
          <div>
            <p className="font-display font-semibold text-sm">Ilé Surulere</p>
            <p className="text-xs text-on-ink/60">CDA Field Collection Form</p>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-ink/5 border-b border-line">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center gap-2 overflow-x-auto">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${i === step ? "bg-ink text-on-ink" : i < step ? "bg-verified text-white" : "bg-line text-muted"}`}>
                {i < step ? <Icon name="check" className="h-3 w-3" /> : i + 1}
              </span>
              <span className={`text-xs ${i === step ? "text-ink font-medium" : "text-muted"}`}>{label}</span>
              {i < STEPS.length - 1 && <span className="w-6 h-px bg-line" />}
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-6">

        {/* ── STEP 0: CDA Info ─────────────────────────────────────────── */}
        {step === 0 && (
          <Section title="CDA Information" subtitle="Who is filling this form?">
            <Field label="Ward" required error={errors.wardId}>
              <select className="field-input" value={wardId} onChange={(e) => { setWardId(e.target.value); setCdaId(""); }}>
                <option value="">{wards ? "Select a ward" : "Loading wards…"}</option>
                {(wards || []).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </Field>
            <Field label="CDA" required error={errors.cdaId}>
              <select className="field-input" value={cdaId} onChange={(e) => setCdaId(e.target.value)} disabled={!wardId}>
                <option value="">{!wardId ? "Select a ward first" : cdaList ? "Select a CDA" : "Loading CDAs…"}</option>
                {(cdaList || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Your full name" required error={errors.agentName}>
              <input className="field-input" placeholder="The person filling this form" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
            </Field>
            <Field label="Your phone number" required error={errors.agentPhone}>
              <input className="field-input" type="tel" placeholder="0800 000 0000" value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} />
            </Field>
          </Section>
        )}

        {/* ── STEP 1: Property ─────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <Section title="Property Details">
              <Field label="Full address" required error={errors.address}>
                <input className="field-input" placeholder="House number, street name" value={address} onChange={(e) => setAddress(e.target.value)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Building type" required error={errors.buildingType}>
                  <select className="field-input" value={buildingType} onChange={(e) => setBuildingType(e.target.value)}>
                    <option value="">Select</option>
                    {BUILDING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Property type" required error={errors.propertyType}>
                  <select className="field-input" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                    <option value="">Select</option>
                    {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
              </div>
            </Section>

            <Section title="Property Owner">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="First name" required error={errors.ownerFirstName}>
                  <input className="field-input" value={ownerFirstName} onChange={(e) => setOwnerFirstName(e.target.value)} />
                </Field>
                <Field label="Last name" required error={errors.ownerLastName}>
                  <input className="field-input" value={ownerLastName} onChange={(e) => setOwnerLastName(e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Phone number" required error={errors.ownerPhone}>
                  <input className="field-input" type="tel" placeholder="0800 000 0000" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
                </Field>
                <Field label="NIN (if available)" error={errors.ownerNin}>
                  <input className="field-input font-mono" inputMode="numeric" maxLength={11} placeholder="11 digits" value={ownerNin} onChange={(e) => setOwnerNin(e.target.value.replace(/\D/g, ""))} />
                </Field>
              </div>
            </Section>

            <Section title="Property photos" subtitle="Take or upload photos of the building. Each image is compressed automatically.">
              <ImageUploader images={images} onAdd={handleImageFiles} onRemove={removeImage} />
            </Section>
          </>
        )}

        {/* ── STEP 2: Residents ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg text-ink font-semibold">Residents</h2>
                <p className="text-sm text-muted mt-0.5">Add every person living at this property. Mark one as head of household.</p>
              </div>
              <button type="button" onClick={addResident} className="btn-secondary text-sm shrink-0">
                <Icon name="plus" className="h-3.5 w-3.5" /> Add resident
              </button>
            </div>

            {errors.headMissing && (
              <p className="field-error">{errors.headMissing}</p>
            )}

            {residents.map((r, i) => (
              <ResidentCard
                key={i} index={i} resident={r} errors={errors}
                onSet={(f, v) => setRes(i, f, v)}
                onSetHead={() => setHead(i)}
                onRemove={residents.length > 1 ? () => removeResident(i) : null}
                onAddMember={() => addMember(i)}
                onSetMember={(mi, f, v) => setMember(i, mi, f, v)}
                onRemoveMember={(mi) => removeMember(i, mi)}
              />
            ))}
          </div>
        )}

        {/* ── STEP 3: Review ────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl text-ink font-semibold">Review & submit</h2>
            <p className="text-sm text-muted">Check everything below before submitting. You can&rsquo;t edit after submission.</p>

            <ReviewCard title="CDA info">
              <RItem label="Agent" value={agentName} />
              <RItem label="Phone" value={agentPhone} />
              <RItem label="Ward" value={(wards || []).find((w) => w.id === wardId)?.name} />
              <RItem label="CDA" value={(cdaList || []).find((c) => c.id === cdaId)?.name} />
            </ReviewCard>

            <ReviewCard title="Property">
              <RItem label="Address" value={address} />
              <RItem label="Building type" value={BUILDING_TYPES.find((t) => t.value === buildingType)?.label} />
              <RItem label="Property type" value={PROPERTY_TYPES.find((t) => t.value === propertyType)?.label} />
              <RItem label="Owner" value={`${ownerFirstName} ${ownerLastName} · ${ownerPhone}`} />
              {ownerNin && <RItem label="Owner NIN" value={ownerNin} mono />}
              <RItem label="Photos" value={`${images.length} image${images.length === 1 ? "" : "s"}`} />
            </ReviewCard>

            {residents.map((r, i) => (
              <ReviewCard key={i} title={`Resident ${i + 1}${r.isHead ? " (Head of household)" : ""}`}>
                <RItem label="Name" value={`${r.firstName} ${r.lastName}`} />
                <RItem label="Phone" value={r.phone} />
                {r.email && <RItem label="Email" value={r.email} />}
                {r.nin && <RItem label="NIN" value={r.nin} mono />}
                {r.unitDescription && <RItem label="Unit" value={r.unitDescription} />}
                {r.householdMembers.length > 0 && (
                  <RItem label="Household members" value={r.householdMembers.map((m) => `${m.firstName} ${m.lastName} (${m.relationship})`).join(", ")} />
                )}
              </ReviewCard>
            ))}

            {globalError && <p className="field-error">{globalError}</p>}
          </div>
        )}

        {/* ── Navigation ────────────────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button onClick={back} className="btn-secondary">
              <Icon name="arrowLeft" className="h-3.5 w-3.5" /> Back
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button onClick={next} className="btn-primary">Continue</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-brass px-6">
              {submitting ? "Submitting…" : "Submit form"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, subtitle, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="font-display text-base text-ink font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="card-body space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="field-label">
        {label}{required && <span className="text-flagged"> *</span>}
      </label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function ImageUploader({ images, onAdd, onRemove }) {
  const inputRef = useRef(null);
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn-secondary w-full py-8 border-dashed flex-col gap-2 text-muted"
      >
        <Icon name="plus" className="h-5 w-5" />
        <span className="text-sm">Tap to add photos</span>
        <span className="text-xs">Images are compressed automatically</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) onAdd(Array.from(e.target.files)); e.target.value = ""; }}
      />
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative rounded-[var(--radius-card)] overflow-hidden aspect-square border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob URL from compressImage, not a static asset */}
              <img src={img.previewUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-ink/70 text-white flex items-center justify-center"
              >
                <Icon name="x" className="h-3 w-3" />
              </button>
              <span className="absolute bottom-1 left-1 text-[10px] text-white bg-ink/60 rounded px-1">{img.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResidentCard({ index, resident: r, errors, onSet, onSetHead, onRemove, onAddMember, onSetMember, onRemoveMember }) {
  const [open, setOpen] = useState(true);
  const pre = `r${index}_`;
  return (
    <div className={`card ${r.isHead ? "border-brass/50" : ""}`}>
      <div className="card-header">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setOpen((o) => !o)} className="text-muted">
            <Icon name={open ? "arrowLeft" : "plus"} className="h-3.5 w-3.5 rotate-90" />
          </button>
          <span className="font-medium text-ink text-sm">
            {r.firstName || r.lastName ? `${r.firstName} ${r.lastName}`.trim() : `Resident ${index + 1}`}
          </span>
          {r.isHead && <span className="pill-brass text-xs">Head of household</span>}
        </div>
        <div className="flex items-center gap-2">
          {!r.isHead && (
            <button type="button" onClick={onSetHead} className="text-xs text-brass font-medium hover:underline">
              Set as head
            </button>
          )}
          {onRemove && (
            <button type="button" onClick={onRemove} className="text-flagged">
              <Icon name="trash" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="First name" required error={errors[`${pre}firstName`]}>
              <input className="field-input" value={r.firstName} onChange={(e) => onSet("firstName", e.target.value)} />
            </Field>
            <Field label="Last name" required error={errors[`${pre}lastName`]}>
              <input className="field-input" value={r.lastName} onChange={(e) => onSet("lastName", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Phone" required error={errors[`${pre}phone`]}>
              <input className="field-input" type="tel" placeholder="0800 000 0000" value={r.phone} onChange={(e) => onSet("phone", e.target.value)} />
            </Field>
            <Field label="Email (optional)" error={errors[`${pre}email`]}>
              <input className="field-input" type="email" placeholder="Leave blank if none" value={r.email} onChange={(e) => onSet("email", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="NIN (11 digits)" error={errors[`${pre}nin`]}>
              <input className="field-input font-mono" inputMode="numeric" maxLength={11} placeholder="Optional" value={r.nin} onChange={(e) => onSet("nin", e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Date of birth">
              <input className="field-input" type="date" value={r.dateOfBirth} onChange={(e) => onSet("dateOfBirth", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Gender">
              <select className="field-input" value={r.gender} onChange={(e) => onSet("gender", e.target.value)}>
                <option value="">Select</option>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Marital status">
              <select className="field-input" value={r.maritalStatus} onChange={(e) => onSet("maritalStatus", e.target.value)}>
                <option value="">Select</option>
                {MARITAL.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="State of origin">
              <select className="field-input" value={r.stateOfOrigin} onChange={(e) => onSet("stateOfOrigin", e.target.value)}>
                <option value="">Select</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Occupation">
              <input className="field-input" placeholder="e.g. Trader" value={r.occupation} onChange={(e) => onSet("occupation", e.target.value)} />
            </Field>
          </div>
          <Field label="Unit / flat description (optional)">
            <input className="field-input" placeholder='e.g. "Flat B", "Ground floor"' value={r.unitDescription} onChange={(e) => onSet("unitDescription", e.target.value)} />
          </Field>

          {/* Household members */}
          <div className="pt-2 border-t border-line">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-ink">Other household members</p>
              <button type="button" onClick={onAddMember} className="btn-ghost text-xs px-2.5 py-1.5">
                <Icon name="plus" className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {r.householdMembers.map((m, mi) => (
                <div key={mi} className="card card-body bg-paper">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted uppercase tracking-wide">Member {mi + 1}</span>
                    <button type="button" onClick={() => onRemoveMember(mi)} className="text-flagged text-xs">Remove</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="First name" required error={errors[`r${index}_m${mi}_firstName`]}>
                      <input className="field-input" value={m.firstName} onChange={(e) => onSetMember(mi, "firstName", e.target.value)} />
                    </Field>
                    <Field label="Last name" required error={errors[`r${index}_m${mi}_lastName`]}>
                      <input className="field-input" value={m.lastName} onChange={(e) => onSetMember(mi, "lastName", e.target.value)} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <Field label="Relationship" required error={errors[`r${index}_m${mi}_rel`]}>
                      <select className="field-input" value={m.relationship} onChange={(e) => onSetMember(mi, "relationship", e.target.value)}>
                        <option value="">Select</option>
                        {RELATIONSHIPS.map((rel) => <option key={rel} value={rel}>{rel}</option>)}
                      </select>
                    </Field>
                    <Field label="Gender">
                      <select className="field-input" value={m.gender} onChange={(e) => onSetMember(mi, "gender", e.target.value)}>
                        <option value="">Select</option>
                        {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <Field label="Age">
                      <input className="field-input" type="number" min="0" max="120" value={m.age} onChange={(e) => onSetMember(mi, "age", e.target.value)} />
                    </Field>
                    <Field label="NIN (if available)">
                      <input className="field-input font-mono" inputMode="numeric" maxLength={11} value={m.nin} onChange={(e) => onSetMember(mi, "nin", e.target.value.replace(/\D/g, ""))} />
                    </Field>
                  </div>
                </div>
              ))}
              {r.householdMembers.length === 0 && (
                <p className="text-xs text-muted italic">No other members — tap Add above if needed.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ title, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="font-display text-sm text-ink font-semibold">{title}</h3>
      </div>
      <div className="card-body grid sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function RItem({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className={`text-sm text-ink font-medium mt-0.5 ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
    </div>
  );
}