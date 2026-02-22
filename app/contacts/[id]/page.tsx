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
  Trash2,
  Plus,
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

  useEffect(() => { refresh(); }, [refresh]);

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
      <div className="min-h-screen bg-background pt-12 flex items-center justify-center">
        <div className="text-muted-foreground text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-background pt-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-3">Contact not found.</p>
          <Link href="/dashboard" className="text-primary text-sm hover:underline">
            ← Dashboard
          </Link>
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
      <div className="flex items-start gap-2.5 group py-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />}
        {editing === field ? (
          <div className="flex items-center gap-1.5 flex-1">
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit(field);
                if (e.key === "Escape") setEditing(null);
              }}
              className="flex-1 px-2 py-0.5 bg-input border border-ring rounded text-foreground text-sm focus:outline-none"
            />
            <button onClick={() => saveEdit(field)} className="text-primary hover:opacity-70">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {value ? (
              href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm truncate">
                  {value}
                </a>
              ) : (
                <span className="text-foreground text-sm truncate">{value}</span>
              )
            ) : (
              <span className="text-muted-foreground/40 text-sm italic">Add {label.toLowerCase()}</span>
            )}
            <button
              onClick={() => startEdit(field, value ?? "")}
              className="opacity-0 group-hover:opacity-100 ml-auto flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-all"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const initials = `${contact.firstName[0] ?? ""}${contact.lastName[0] ?? ""}`.toUpperCase();
  const activeReminders = contact.reminders.filter((r) => !r.isCompleted);

  return (
    <div className="min-h-screen bg-background pt-12">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile card */}
            <div className="card p-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-secondary border border-border flex items-center justify-center text-primary font-medium text-lg flex-shrink-0 overflow-hidden">
                  {contact.avatarUrl ? (
                    <img src={contact.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : initials}
                </div>
                <div className="min-w-0">
                  <h1 className="font-serif text-xl text-foreground truncate">
                    {contact.firstName} {contact.lastName}
                  </h1>
                  <span className="section-label">{contact.source}</span>
                </div>
              </div>

              {/* Fields */}
              <div className="divide-y divide-border/50">
                <EditableField field="jobTitle" label="Job Title" icon={Building2} />
                <EditableField field="company" label="Company" icon={Building2} />
                <EditableField field="email" label="Email" icon={Mail} href={contact.email ? `mailto:${contact.email}` : undefined} />
                <EditableField field="phone" label="Phone" icon={Phone} />
                <EditableField field="city" label="City" icon={MapPin} />
                <EditableField field="country" label="Country" icon={MapPin} />
                <EditableField field="linkedinUrl" label="LinkedIn" icon={Linkedin} href={contact.linkedinUrl ?? undefined} />
              </div>

              {/* Notes */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="section-label mb-1.5">Notes</p>
                <EditableField field="notes" label="Notes" />
              </div>

              {/* Meta */}
              <div className="mt-4 pt-4 border-t border-border space-y-0.5">
                <p className="text-[10px] text-muted-foreground/50">
                  Added {format(new Date(contact.createdAt), "d MMM yyyy")}
                </p>
                <p className="text-[10px] text-muted-foreground/50">
                  Updated {format(new Date(contact.updatedAt), "d MMM yyyy")}
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={handleDelete}
                className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground/50 hover:text-destructive transition-colors py-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete contact
              </button>
            </div>

            {/* Reminders */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <p className="section-label">Reminders</p>
                <button
                  onClick={() => setShowReminderForm(!showReminderForm)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {showReminderForm && (
                <form onSubmit={addReminder} className="p-4 border-b border-border space-y-2.5">
                  <input
                    type="text"
                    placeholder="Reminder note"
                    value={reminderForm.message}
                    onChange={(e) => setReminderForm((f) => ({ ...f, message: e.target.value }))}
                    required
                    className="field-input"
                  />
                  <input
                    type="date"
                    value={reminderForm.dueDate}
                    onChange={(e) => setReminderForm((f) => ({ ...f, dueDate: e.target.value }))}
                    required
                    className="field-input"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary flex-1 text-xs py-1.5">Save</button>
                    <button type="button" onClick={() => setShowReminderForm(false)} className="btn-ghost flex-1 text-xs py-1.5">Cancel</button>
                  </div>
                </form>
              )}

              {activeReminders.length === 0 ? (
                <p className="text-muted-foreground/50 text-xs px-5 py-4">No active reminders.</p>
              ) : (
                <div className="divide-y divide-border/50">
                  {activeReminders.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm">{r.message}</p>
                        <p className="text-primary/70 text-xs mt-0.5">
                          {format(new Date(r.dueDate), "d MMM yyyy")}
                        </p>
                      </div>
                      <button
                        onClick={() => completeReminder(r.id)}
                        className="flex-shrink-0 w-6 h-6 rounded-full border border-border hover:border-primary/50 hover:text-primary text-muted-foreground/40 flex items-center justify-center transition-colors mt-0.5"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: timeline */}
          <div className="lg:col-span-2">
            <div className="card p-6">
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
