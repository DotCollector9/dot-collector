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
        className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-primary hover:opacity-90 text-primary-foreground rounded-full shadow-xl flex items-center justify-center transition-opacity active:scale-95"
        aria-label="Add contact"
      >
        <Plus className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/75 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl text-foreground">Add Contact</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
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
