"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";

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
    <div className="min-h-screen bg-background pt-12">
      <div className="max-w-xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="border-b border-border pb-6 mb-8">
          <h1 className="font-serif text-3xl text-foreground">Import Contacts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload a CSV — LinkedIn exports are auto-detected.
          </p>
        </div>

        {/* Upload stage */}
        {stage === "upload" && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary/60 bg-primary/5"
                  : "border-border hover:border-border/80 hover:bg-secondary/30"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" strokeWidth={1} />
              {loading ? (
                <p className="text-muted-foreground text-sm animate-pulse">Analysing…</p>
              ) : isDragActive ? (
                <p className="text-primary text-sm">Drop to upload</p>
              ) : (
                <>
                  <p className="text-foreground text-sm font-medium">Drop a CSV file here</p>
                  <p className="text-muted-foreground text-xs mt-1">or click to browse</p>
                </>
              )}
            </div>

            <div className="card p-4 space-y-1.5">
              <p className="section-label mb-2">Supported formats</p>
              <p className="text-muted-foreground text-xs">
                <span className="text-foreground">LinkedIn export</span> — Settings → Data Privacy → Get a copy → Connections
              </p>
              <p className="text-muted-foreground text-xs">
                <span className="text-foreground">Generic CSV</span> — any spreadsheet; columns mapped in the next step
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Mapping stage */}
        {stage === "mapping" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-sm">
                <span className="text-foreground">{file?.name}</span> · {headers.length} columns
              </p>
            </div>

            <div className="card overflow-hidden">
              <div className="divide-y divide-border/50">
                {FIELD_LABELS.map(({ key, label, required }) => (
                  <div key={key} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="w-28 flex-shrink-0">
                      <span className="text-xs text-foreground">{label}</span>
                      {required && <span className="text-primary ml-0.5 text-xs">*</span>}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
                    <select
                      value={mapping[key] ?? ""}
                      onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value || undefined }))}
                      className="flex-1 field-input py-1.5 text-xs"
                    >
                      <option value="">— skip —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="btn-outline">
                ← Start over
              </button>
              <button
                onClick={handleSubmitMapping}
                disabled={loading || !mapping.firstName}
                className="btn-primary flex-1"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Import Contacts
              </button>
            </div>
          </div>
        )}

        {/* Result stage */}
        {stage === "result" && result && (
          <div className="text-center space-y-6">
            <div>
              <CheckCircle className="w-10 h-10 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <h2 className="font-serif text-2xl text-foreground">Import complete</h2>
              <p className="text-muted-foreground text-sm mt-1">Your contacts have been added.</p>
            </div>

            <div className="grid grid-cols-3 gap-px bg-border rounded-lg overflow-hidden">
              <div className="bg-card px-4 py-5">
                <div className="font-serif text-3xl text-foreground">{result.imported}</div>
                <div className="section-label mt-1">Imported</div>
              </div>
              <div className="bg-card px-4 py-5">
                <div className="font-serif text-3xl text-foreground">{result.skipped}</div>
                <div className="section-label mt-1">Duplicates</div>
              </div>
              <div className="bg-card px-4 py-5">
                <div className="font-serif text-3xl text-foreground">{result.errors.length}</div>
                <div className="section-label mt-1">Errors</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="text-left p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                {result.errors.slice(0, 5).map((e, i) => (
                  <p key={i} className="text-destructive/80 text-xs">{e}</p>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button onClick={reset} className="btn-outline">
                Import another
              </button>
              <a href="/" className="btn-primary">
                View on Globe
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
