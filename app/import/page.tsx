"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, AlertCircle, FileText, ArrowRight, RefreshCw } from "lucide-react";

interface ColumnMapping {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  city?: string;
  country?: string;
  linkedinUrl?: string;
}

const FIELD_LABELS: { key: keyof ColumnMapping; label: string; required?: boolean }[] = [
  { key: "firstName", label: "First Name", required: true },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "company", label: "Company" },
  { key: "jobTitle", label: "Job Title" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "linkedinUrl", label: "LinkedIn URL" },
];

type Stage = "upload" | "mapping" | "result";

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export default function ImportPage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const data = await res.json();

      if (data.needsMapping) {
        setHeaders(data.headers);
        // Auto-guess mapping from header names
        const autoMap: ColumnMapping = {};
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
        for (const h of data.headers) {
          const n = normalize(h);
          if (n.includes("firstname") || n === "first") autoMap.firstName = h;
          else if (n.includes("lastname") || n === "last") autoMap.lastName = h;
          else if (n.includes("email")) autoMap.email = h;
          else if (n.includes("phone") || n.includes("mobile")) autoMap.phone = h;
          else if (n.includes("company") || n.includes("organization")) autoMap.company = h;
          else if (n.includes("jobtitle") || n.includes("title") || n.includes("position")) autoMap.jobTitle = h;
          else if (n.includes("city")) autoMap.city = h;
          else if (n.includes("country")) autoMap.country = h;
          else if (n.includes("linkedin")) autoMap.linkedinUrl = h;
        }
        setMapping(autoMap);
        setStage("mapping");
      } else {
        setResult(data);
        setStage("result");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "text/plain": [".txt"] },
    maxFiles: 1,
  });

  const handleSubmitMapping = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mapping", JSON.stringify(mapping));
    try {
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const data = await res.json();
      setResult(data);
      setStage("result");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage("upload");
    setFile(null);
    setHeaders([]);
    setMapping({});
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-1">Import Contacts</h1>
        <p className="text-gray-400 text-sm mb-8">
          Upload a CSV file — LinkedIn data export is auto-detected and imported directly.
          For other files, you&apos;ll map the columns.
        </p>

        {/* Stage: Upload */}
        {stage === "upload" && (
          <div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-400 bg-blue-900/10"
                  : "border-gray-600 bg-gray-800/30 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              {loading ? (
                <p className="text-gray-300 animate-pulse">Analysing file...</p>
              ) : isDragActive ? (
                <p className="text-blue-300">Drop the file here</p>
              ) : (
                <>
                  <p className="text-gray-300 font-medium">Drag & drop a CSV file</p>
                  <p className="text-gray-500 text-sm mt-1">or click to browse</p>
                </>
              )}
            </div>

            <div className="mt-6 p-4 bg-gray-800/40 border border-gray-700 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" /> Supported formats
              </h3>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• <strong className="text-gray-400">LinkedIn export</strong> — download from LinkedIn Settings → Data Privacy → Get a copy of your data → Connections</li>
                <li>• <strong className="text-gray-400">Generic CSV</strong> — any spreadsheet export; you&apos;ll map columns in the next step</li>
              </ul>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-400 text-sm p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Stage: Column mapping */}
        {stage === "mapping" && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
              <FileText className="w-4 h-4" />
              <span className="font-medium text-white">{file?.name}</span>
              <span>— {headers.length} columns detected</span>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Map your CSV columns to contact fields. Auto-guessed where possible.
            </p>

            <div className="space-y-3">
              {FIELD_LABELS.map(({ key, label, required }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-gray-400 flex-shrink-0">
                    {label}
                    {required && <span className="text-red-400 ml-0.5">*</span>}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <select
                    value={mapping[key] ?? ""}
                    onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value || undefined }))}
                    className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="">— skip —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={reset}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-600 rounded-lg transition-colors"
              >
                ← Start over
              </button>
              <button
                onClick={handleSubmitMapping}
                disabled={loading || !mapping.firstName}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Import Contacts
              </button>
            </div>
          </div>
        )}

        {/* Stage: Result */}
        {stage === "result" && result && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-1">Import complete</h2>
            <p className="text-gray-400 text-sm mb-6">
              Your contacts have been added to the network.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400">{result.imported}</div>
                <div className="text-xs text-gray-400">Imported</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-300">{result.skipped}</div>
                <div className="text-xs text-gray-400">Skipped (duplicates)</div>
              </div>
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-400">{result.errors.length}</div>
                <div className="text-xs text-gray-400">Errors</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="text-left mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-xs font-medium mb-1">Errors:</p>
                {result.errors.slice(0, 5).map((e, i) => (
                  <p key={i} className="text-red-400/70 text-xs">{e}</p>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-4 py-2 text-sm border border-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                Import another file
              </button>
              <a
                href="/"
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                View on Globe
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
