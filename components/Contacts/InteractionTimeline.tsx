"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MessageSquare,
  Mail,
  Users,
  Phone,
  Linkedin,
  PlusCircle,
  Trash2,
} from "lucide-react";

interface Interaction {
  id: string;
  type: string;
  date: string;
  notes: string | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  note: MessageSquare,
  email: Mail,
  meeting: Users,
  call: Phone,
  linkedin: Linkedin,
};

const TYPE_COLORS: Record<string, string> = {
  note: "text-gray-400 bg-gray-700/50",
  email: "text-blue-400 bg-blue-900/30",
  meeting: "text-purple-400 bg-purple-900/30",
  call: "text-green-400 bg-green-900/30",
  linkedin: "text-sky-400 bg-sky-900/30",
};

interface Props {
  contactId: string;
  interactions: Interaction[];
  onRefresh: () => void;
}

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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold">Interaction Timeline</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Log interaction
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 p-3 bg-gray-800/60 border border-gray-700 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                {["note", "email", "meeting", "call", "linkedin"].map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="What happened?"
              className="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-400 hover:text-white px-3 py-1.5">Cancel</button>
            <button type="submit" disabled={saving} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}

      {interactions.length === 0 ? (
        <p className="text-gray-500 text-sm py-4 text-center">No interactions logged yet.</p>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-700" />
          <div className="space-y-4">
            {interactions.map((ix) => {
              const Icon = TYPE_ICONS[ix.type] ?? MessageSquare;
              const colorClass = TYPE_COLORS[ix.type] ?? TYPE_COLORS.note;
              return (
                <div key={ix.id} className="flex gap-3 pl-2 group">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${colorClass} z-10`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 capitalize">{ix.type}</span>
                      <span className="text-xs text-gray-600">
                        {format(new Date(ix.date), "d MMM yyyy")}
                      </span>
                      <button
                        onClick={() => handleDelete(ix.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {ix.notes && <p className="text-gray-300 text-sm mt-0.5">{ix.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
