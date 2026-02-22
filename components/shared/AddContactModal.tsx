"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import ContactForm from "@/components/Contacts/ContactForm";
import { useRouter } from "next/navigation";

export default function AddContactModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: Parameters<typeof ContactForm>[0]["initial"]) => {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create contact");
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Add contact"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg">Add Contact</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ContactForm
              onSubmit={handleSubmit}
              onCancel={() => setOpen(false)}
              submitLabel="Add Contact"
            />
          </div>
        </div>
      )}
    </>
  );
}
