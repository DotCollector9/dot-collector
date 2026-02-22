"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  city: string;
  country: string;
  linkedinUrl: string;
  notes: string;
}

interface ContactFormProps {
  initial?: Partial<ContactFormData>;
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

const EMPTY: ContactFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  city: "",
  country: "",
  linkedinUrl: "",
  notes: "",
};

export default function ContactForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName && !form.lastName) {
      setError("First or last name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label,
    field,
    type = "text",
    placeholder,
  }: {
    label: string;
    field: keyof ContactFormData;
    type?: string;
    placeholder?: string;
  }) => (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={set(field)}
        placeholder={placeholder}
        className="field-input"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name *" field="firstName" placeholder="Jane" />
        <Field label="Last Name" field="lastName" placeholder="Smith" />
      </div>
      <Field label="Email" field="email" type="email" placeholder="jane@example.com" />
      <Field label="Phone" field="phone" placeholder="+1 555 000 0000" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company" field="company" placeholder="Acme Corp" />
        <Field label="Job Title" field="jobTitle" placeholder="CEO" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City" field="city" placeholder="London" />
        <Field label="Country" field="country" placeholder="GB" />
      </div>
      <Field label="LinkedIn URL" field="linkedinUrl" placeholder="https://linkedin.com/in/..." />
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
          Notes
        </label>
        <textarea
          value={form.notes}
          onChange={set("notes")}
          rows={3}
          placeholder="Met at conference..."
          className="field-input resize-none"
        />
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
        )}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
