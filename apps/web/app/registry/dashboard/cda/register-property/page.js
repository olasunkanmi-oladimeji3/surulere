"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/lib/useRequireRole";
import { cdaRegisterProperty } from "@/lib/data";
import { sendWelcomeEmail } from "@/lib/email";
import Shell from "@/components/Shell";
import Icon from "@/components/Icon";
import PageLoading from "@/components/PageLoading";
import PropertyFieldsSection, { initialPropertyForm } from "@/components/forms/PropertyFieldsSection";
import { TextField } from "@/components/forms/fieldKit";

const initialForm = { ownerName: "", ownerEmail: "", ownerPhone: "", ownerNin: "", ...initialPropertyForm };

export default function CdaRegisterPropertyPage() {
  const { user, ready } = useRequireRole("cda");
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  if (!ready) return <PageLoading />;

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
    const units = Array.from({ length: form.unitCount }, () => ({
      occupancyType: form.unitOccupancyType,
      tenancyType: form.unitTenancyType,
    }));
    const result = cdaRegisterProperty(user.id, { ...form, units });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const { message } = await sendWelcomeEmail({
      to: result.owner.email,
      name: result.owner.name,
      idLabel: "Property ID", idValue: result.property.property_number,
      tempPassword: result.tempPassword,
      intro: "A CDA member registered your property on Ilé Surulere, the Surulere LG community registry, on your behalf.",
    });
    setConfirmation({ owner: result.owner, property: result.property, message });
  }

  if (confirmation) {
    return (
      <Shell user={user}>
        <div className="card card-body text-center py-10 max-w-md mx-auto">
          <div className="mx-auto h-12 w-12 rounded-full bg-verified-tint border border-verified/40 flex items-center justify-center text-verified mb-4">
            <Icon name="check" className="h-5 w-5" />
          </div>
          <h2 className="font-display text-xl text-ink font-semibold">Property registered</h2>
          <p className="text-sm text-muted mt-2">
            {confirmation.property.property_number} is on the registry under {confirmation.owner.name}. Here&rsquo;s
            exactly what was emailed to <strong>{confirmation.owner.email}</strong> — this demo can&rsquo;t send real
            email, so it&rsquo;s shown here instead. The owner adds their tenants once they log in.
          </p>
          <div className="card bg-paper text-left mt-6">
            <div className="card-header"><span className="text-sm font-medium text-ink">{confirmation.message.subject}</span></div>
            <div className="card-body"><pre className="text-sm text-text whitespace-pre-wrap font-sans">{confirmation.message.body}</pre></div>
          </div>
          <div className="flex gap-2.5 mt-6 justify-center">
            <button onClick={() => { setForm(initialForm); setConfirmation(null); }} className="btn-secondary">Register another</button>
            <button onClick={() => router.push("/registry/dashboard/cda")} className="btn-primary">Back to my ward</button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell user={user}>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink font-semibold">Register a property</h1>
        <p className="text-sm text-muted mt-1">
          For an owner you&rsquo;ve met on the ground who isn&rsquo;t on the registry yet. They&rsquo;ll get a login by
          email and add their own tenants afterwards — you&rsquo;re just getting the property on file.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card card-body space-y-5 max-w-3xl">
        <div>
          <h2 className="font-display text-base text-ink font-semibold">Owner</h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <TextField label="Full name" required value={form.ownerName} onChange={(v) => setField("ownerName", v)} />
            <TextField label="Email address" type="email" required value={form.ownerEmail} onChange={(v) => setField("ownerEmail", v)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <TextField label="Phone number" type="tel" required value={form.ownerPhone} onChange={(v) => setField("ownerPhone", v)} />
            <TextField label="NIN" mono maxLength={11} inputMode="numeric" value={form.ownerNin} onChange={(v) => setField("ownerNin", v)} placeholder="11 digits, if they have it on them" />
          </div>
        </div>

        <div className="pt-1 border-t border-line">
          <PropertyFieldsSection form={form} setField={setField} setForm={setForm} />
        </div>

        {error && <p className="field-error">{error}</p>}

        <div className="flex justify-end pt-2 border-t border-line">
          <button type="submit" className="btn-primary">Register property</button>
        </div>
      </form>
    </Shell>
  );
}
