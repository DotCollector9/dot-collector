"use client";

import { useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";

interface SyncResult {
  contactsImported: number;
  interactionsLogged: number;
  errors: string[];
}

export default function SyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/sync/gmail");
      if (res.status === 401) {
        setError("Not authenticated. Please sign in with Google first.");
        return;
      }
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "/api/auth/signin/google";
  };

  return (
    <div className="min-h-screen bg-background pt-12">
      <div className="max-w-md mx-auto px-6 py-10">
        {/* Header */}
        <div className="border-b border-border pb-6 mb-8">
          <h1 className="font-serif text-3xl text-foreground">Gmail Sync</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Import Google Contacts and log email interactions automatically.
          </p>
        </div>

        <div className="space-y-6">
          {/* What syncs */}
          <div className="card p-5 space-y-3">
            <p className="section-label">What gets synced</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>→ Google Contacts imported as new contacts</p>
              <p>→ Gmail threads logged as interactions</p>
            </div>
          </div>

          {/* Setup note */}
          <div className="card p-4 border-primary/20">
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">Setup required.</span>{" "}
              Gmail sync needs a Google Cloud project with OAuth credentials.{" "}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-primary hover:underline"
              >
                Open Console <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleGoogleSignIn} className="btn-outline flex-1">
              Sign in with Google
            </button>
            <button onClick={handleSync} disabled={loading} className="btn-primary flex-1">
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Sync Now
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="text-destructive text-sm p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <p className="section-label">Sync complete</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-border">
                <div className="bg-card px-5 py-5">
                  <div className="font-serif text-3xl text-foreground">{result.contactsImported}</div>
                  <div className="section-label mt-1">Contacts</div>
                </div>
                <div className="bg-card px-5 py-5">
                  <div className="font-serif text-3xl text-foreground">{result.interactionsLogged}</div>
                  <div className="section-label mt-1">Interactions</div>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="px-5 py-3 text-xs text-muted-foreground space-y-0.5">
                  {result.errors.slice(0, 3).map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
