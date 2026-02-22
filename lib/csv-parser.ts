import Papa from "papaparse";

export interface ParsedContact {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  city?: string;
  country?: string;
  linkedinUrl?: string;
  source: "linkedin" | "csv";
}

export interface ColumnMapping {
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

// LinkedIn data export headers
const LINKEDIN_HEADERS = [
  "First Name",
  "Last Name",
  "Email Address",
  "Company",
  "Position",
  "Connected On",
];

function isLinkedInExport(headers: string[]): boolean {
  const normalized = headers.map((h) => h.trim());
  return LINKEDIN_HEADERS.every((h) => normalized.includes(h));
}

export function parseCSV(csvText: string): {
  headers: string[];
  rows: Record<string, string>[];
  isLinkedIn: boolean;
} {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const headers = result.meta.fields ?? [];
  return {
    headers,
    rows: result.data,
    isLinkedIn: isLinkedInExport(headers),
  };
}

export function mapLinkedInRows(
  rows: Record<string, string>[]
): ParsedContact[] {
  return rows
    .map((row) => ({
      firstName: row["First Name"]?.trim() ?? "",
      lastName: row["Last Name"]?.trim() ?? "",
      email: row["Email Address"]?.trim() || undefined,
      company: row["Company"]?.trim() || undefined,
      jobTitle: row["Position"]?.trim() || undefined,
      source: "linkedin" as const,
    }))
    .filter((c) => c.firstName || c.lastName);
}

export function mapGenericRows(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): ParsedContact[] {
  return rows
    .map((row) => {
      const get = (key: keyof ColumnMapping) =>
        mapping[key] ? row[mapping[key]!]?.trim() || undefined : undefined;
      const firstName = get("firstName") ?? "";
      const lastName = get("lastName") ?? "";
      return {
        firstName,
        lastName,
        email: get("email"),
        phone: get("phone"),
        company: get("company"),
        jobTitle: get("jobTitle"),
        city: get("city"),
        country: get("country"),
        linkedinUrl: get("linkedinUrl"),
        source: "csv" as const,
      };
    })
    .filter((c) => c.firstName || c.lastName);
}
