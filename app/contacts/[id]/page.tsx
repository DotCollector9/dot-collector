"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Linkedin,
  Edit3,
  Check,
  X,
  Bell,
  Trash2,
} from "lucide-react";
import InteractionTimeline from "@/components/Contacts/InteractionTimeline";
import { format } from "date-fns";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  city: string | null;
  country: string | null;
  linkedinUrl: string | null;
  notes: string | null;
  source: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  interactions: {
    id: string;
    type: string;
    date: string;
    notes: string | null;
    createdAt: string;
  }[];
  reminders: {
    id: string;
    dueDate: string;
    message: string;
    isCompleted: boolean;
  }[];
}

export default function ContactPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderForm, setReminderForm] = useState({ message: "", dueDate: "" });

  const refresh = useCallback(() => {
    fetch(`/api/contacts/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setContact(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startEdit = (field: string, value: string) => {
    setEditing(field);
    setEditValue(value ?? "");
  };

  const saveEdit = async (field: string) => {
    await fetch(`/api/contacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: editValue }),
    });
    setEditing(null);
    refresh();
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${contact?.firstName} ${contact?.lastName}? This cannot be undone.`)) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId: id, ...reminderForm }),
    });
    setShowReminderForm(false);
    setReminderForm({ message: "", dueDate: "" });
    refresh();
  };

  const completeReminder = async (remId: string) => {
    await fetch(`/api/reminders/${remId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: true }),
    });
    refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-16 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gray-950 pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">Contact not found.</p>
          <Link href="/dashboard" className="text-blue-400 hover:underline">← Dashboard</Link>
        </div>
      </div>
    );
  }

  const EditableField = ({
    field,
    label,
    icon: Icon,
    href,
  }: {
    field: keyof Contact;
    label: string;
    icon?: React.ElementType;
    href?: string;
  }) => {
    const value = contact[field] as string | null;
    return (
      <div className="flex items-start gap-2 group">
        {Icon && <Icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />}
        {editing === field ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit(field);
                if (e.key === "Escape") setEditing(null);
              }}
              className="flex-1 px-2 py-0.5 bg-gray-800 border border-blue-500 rounded text-white text-sm"
            />
            <button onClick={() => saveEdit(field)} className="text-green-400 hover:text-green-300"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1 flex-1">
            {value ? (
              href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">{value}</a>
              ) : (
                <span className="text-gray-200 text-sm">{value}</span>
              )
            ) : (
              <span className="text-gray-600 text-sm italic">Add {label.toLowerCase()}</span>
            )}
            <button
              onClick={() => startEdit(field, value ?? "")}
              className="opacity-0 group-hover:opacity-100 ml-1 text-gray-600 hover:text-gray-300 transition-all"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const initials = `${contact.firstName[0] ?? ""}${contact.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: contact details */}
          <div className="lg:col-span-1 space-y-4">
            {/* Header */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-600/30 border-2 border-blue-500/40 flex items-center justify-center text-blue-200 font-bold text-xl flex-shrink-0 overflow-hidden">
                  {contact.avatarUrl ? (
                    <img src={contact.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : initials}
                </div>
                <div>
                  <h1 className="text-white font-bold text-xl">
                    {contact.firstName} {contact.lastName}
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 capitalize">
                    {contact.source}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <EditableField field="jobTitle" label="Job Title" icon={Building2} />
                <EditableField field="company" label="Company" icon={Building2} />
                <EditableField field="email" label="Email" icon={Mail} href={contact.email ? `mailto:${contact.email}` : undefined} />
                <EditableField field="phone" label="Phone" icon={Phone} />
                <EditableField field="city" label="City" icon={MapPin} />
                <EditableField field="country" label="Country" icon={MapPin} />
                <EditableField field="linkedinUrl" label="LinkedIn" icon={Linkedin} href={contact.linkedinUrl ?? undefined} />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <EditableField field="notes" label="Notes" />
              </div>

              <div className="mt-4 text-xs text-gray-600 space-y-0.5">
                <p>Added {format(new Date(contact.createdAt), "d MMM yyyy")}</p>
                <p>Updated {format(new Date(contact.updatedAt), "d MMM yyyy")}</p>
              </div>

              <button
                onClick={handleDelete}
                className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 px-3 py-2 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete contact
              </button>
            </div>

            {/* Reminders */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-yellow-400" />
                  Reminders
                </h3>
                <button
                  onClick={() => setShowReminderForm(!showReminderForm)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  + Add
                </button>
              </div>

              {showReminderForm && (
                <form onSubmit={addReminder} className="mb-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Reminder message"
                    value={reminderForm.message}
                    onChange={(e) => setReminderForm((f) => ({ ...f, message: e.target.value }))}
                    required
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                  <input
                    type="date"
                    value={reminderForm.dueDate}
                    onChange={(e) => setReminderForm((f) => ({ ...f, dueDate: e.target.value }))}
                    required
                    className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded">Save</button>
                    <button type="button" onClick={() => setShowReminderForm(false)} className="flex-1 text-sm text-gray-400 hover:text-white">Cancel</button>
                  </div>
                </form>
              )}

              {contact.reminders.filter((r) => !r.isCompleted).length === 0 ? (
                <p className="text-gray-600 text-xs">No active reminders.</p>
              ) : (
                <div className="space-y-2">
                  {contact.reminders
                    .filter((r) => !r.isCompleted)
                    .map((r) => (
                      <div key={r.id} className="flex items-start gap-2 text-sm">
                        <div className="flex-1">
                          <p className="text-gray-200">{r.message}</p>
                          <p className="text-yellow-400/70 text-xs">{format(new Date(r.dueDate), "d MMM yyyy")}</p>
                        </div>
                        <button
                          onClick={() => completeReminder(r.id)}
                          className="text-gray-500 hover:text-green-400 mt-0.5"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: timeline */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
              <InteractionTimeline
                contactId={id}
                interactions={contact.interactions}
                onRefresh={refresh}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
