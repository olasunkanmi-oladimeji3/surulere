"use client";

/** Small shared field components used by every form in the app — the
 *  registration/property/tenant forms all import from here instead of
 *  redefining the same input wrappers. */

export function TextField({ label, value, onChange, type = "text", required, mono, ...rest }) {
  return (
    <div>
      <label className="field-label">{label}{required && <span className="text-flagged"> *</span>}</label>
      <input
        className={`field-input ${mono ? "font-mono" : ""}`}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
}

export function SelectField({ label, value, onChange, options, required, disabled, capitalize, placeholder = "Select" }) {
  const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: capitalize ? capitalizeWord(o) : o } : o));
  return (
    <div>
      <label className="field-label">{label}{required && <span className="text-flagged"> *</span>}</label>
      <select
        className="field-input"
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function FileField({ label, accept, value, onChange }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        className="field-input text-sm file:mr-3 file:rounded-[var(--radius-card)] file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-on-ink hover:file:bg-ink-soft file:cursor-pointer cursor-pointer"
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {value && <span className="field-hint">{value.name}</span>}
    </div>
  );
}

export function ReviewItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className="text-ink font-medium mt-0.5">{value || "—"}</p>
    </div>
  );
}

export function labelOptions(labelMap) {
  return Object.entries(labelMap).map(([value, label]) => ({ value, label }));
}

export function capitalizeWord(w) {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

export function fileToDataUrlIfSmall(file, maxBytes = 400_000) {
  return new Promise((resolve) => {
    if (!file || file.size > maxBytes) return resolve(undefined);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}
