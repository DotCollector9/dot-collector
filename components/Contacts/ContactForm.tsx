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
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={set(field)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
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
        <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={set("notes")}
          rows={3}
          placeholder="Met at conference..."
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none"
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm rounded-md font-medium transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
