"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";

interface Interaction {
  id: string;
  type: string;
  date: string;
  notes: string | null;
  createdAt: string;
}

interface Props {
  contactId: string;
  interactions: Interaction[];
  onRefresh: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  note: "Note",
  email: "Email",
  meeting: "Meeting",
  call: "Call",
  linkedin: "LinkedIn",
};

export default function InteractionTimeline({ contactId, interactions, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "note", date: new Date().toISOString().slice(0, 10), notes: "" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId, ...form }),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ type: "note", date: new Date().toISOString().slice(0, 10), notes: "" });
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this interaction?")) return;
    await fetch(`/api/interactions/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif text-lg text-foreground">Timeline</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Log
        </button>
      </div>

      {/* Log form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-5 p-4 bg-secondary/50 border border-border rounded-lg space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label block mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="field-input"
              >
                {["note", "email", "meeting", "call", "linkedin"].map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="section-label block mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="field-input"
              />
            </div>
          </div>
          <div>
            <label className="section-label block mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="What happened?"
              className="field-input resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs py-1.5 px-3"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {interactions.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">No interactions logged yet.</p>
      ) : (
        <div className="space-y-0">
          {interactions.map((ix, i) => (
            <div key={ix.id} className="flex gap-4 group relative">
              {/* Left column: date + line */}
              <div className="flex flex-col items-center w-16 flex-shrink-0 pt-1">
                <div className="text-[10px] text-muted-foreground/60 text-right whitespace-nowrap">
                  {format(new Date(ix.date), "d MMM")}
                </div>
                {i < interactions.length - 1 && (
                  <div className="flex-1 w-px bg-border mt-1" />
                )}
              </div>

              {/* Right column: content */}
              <div className="flex-1 pb-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
                    {TYPE_LABELS[ix.type] ?? ix.type}
                  </span>
                  <button
                    onClick={() => handleDelete(ix.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                {ix.notes && (
                  <p className="text-foreground/80 text-sm mt-1 leading-relaxed">{ix.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
