"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

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
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
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
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-1">Gmail Sync</h1>
        <p className="text-gray-400 text-sm mb-8">
          Import your Google Contacts and log email interactions automatically.
        </p>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
          <div className="space-y-2 text-sm text-gray-400">
            <p className="font-medium text-gray-300">What gets synced:</p>
            <ul className="space-y-1 pl-2">
              <li>• Google Contacts → imported as new contacts (if not already present)</li>
              <li>• Gmail emails → logged as interactions on matching contacts</li>
            </ul>
          </div>

          <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-xs text-yellow-300">
            <strong>Setup required:</strong> Gmail sync needs a Google Cloud project with OAuth credentials.
            See <code className="bg-yellow-900/30 px-1 rounded">.env.local.example</code> for instructions.
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 ml-1 underline"
            >
              Open Console <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGoogleSignIn}
              className="flex-1 px-4 py-2 text-sm border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 rounded-lg transition-colors"
            >
              Sign in with Google
            </button>
            <button
              onClick={handleSync}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Sync Now
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 text-red-400 text-sm p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-4 p-5 bg-green-900/20 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Sync complete</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{result.contactsImported}</div>
                <div className="text-xs text-gray-400">Contacts imported</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{result.interactionsLogged}</div>
                <div className="text-xs text-gray-400">Interactions logged</div>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-3 text-xs text-yellow-400">
                {result.errors.slice(0, 3).map((e, i) => <p key={i}>{e}</p>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
