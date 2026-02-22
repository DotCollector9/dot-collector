import { google } from "googleapis";
import prisma from "./db";

function getOAuth2Client(accessToken: string, refreshToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return oauth2Client;
}

export interface GmailSyncResult {
  contactsImported: number;
  interactionsLogged: number;
  errors: string[];
}

export async function syncGmailContacts(
  accessToken: string,
  refreshToken?: string
): Promise<GmailSyncResult> {
  const result: GmailSyncResult = {
    contactsImported: 0,
    interactionsLogged: 0,
    errors: [],
  };

  const auth = getOAuth2Client(accessToken, refreshToken);

  // --- 1. Import Google Contacts via People API ---
  try {
    const people = google.people({ version: "v1", auth });
    const connectionsResp = await people.people.connections.list({
      resourceName: "people/me",
      pageSize: 1000,
      personFields:
        "names,emailAddresses,phoneNumbers,organizations,addresses",
    });

    const connections = connectionsResp.data.connections ?? [];

    for (const person of connections) {
      const name = person.names?.[0];
      const emailEntry = person.emailAddresses?.[0];
      const phone = person.phoneNumbers?.[0]?.value;
      const org = person.organizations?.[0];
      const address = person.addresses?.[0];

      if (!name) continue;
      const firstName = name.givenName ?? "";
      const lastName = name.familyName ?? "";
      const email = emailEntry?.value;

      if (!firstName && !lastName) continue;

      // Check if already exists
      const existing = email
        ? await prisma.contact.findFirst({ where: { email } })
        : null;

      if (!existing) {
        await prisma.contact.create({
          data: {
            firstName,
            lastName,
            email,
            phone,
            company: org?.name,
            jobTitle: org?.title,
            city: address?.city,
            country: address?.country,
            source: "gmail",
          },
        });
        result.contactsImported++;
      }
    }
  } catch (err) {
    result.errors.push(`Contacts import error: ${String(err)}`);
  }

  // --- 2. Log email interactions via Gmail API ---
  try {
    const gmail = google.gmail({ version: "v1", auth });

    // Get all contacts with email addresses
    const contacts = await prisma.contact.findMany({
      where: { email: { not: null } },
      select: { id: true, email: true },
    });

    for (const contact of contacts.slice(0, 50)) {
      // cap to avoid rate limits
      if (!contact.email) continue;

      try {
        const listResp = await gmail.users.messages.list({
          userId: "me",
          q: `from:${contact.email} OR to:${contact.email}`,
          maxResults: 10,
        });

        const messages = listResp.data.messages ?? [];

        for (const msg of messages) {
          if (!msg.id) continue;

          const existing = await prisma.interaction.findFirst({
            where: {
              contactId: contact.id,
              notes: { contains: msg.id },
            },
          });
          if (existing) continue;

          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id,
            format: "metadata",
            metadataHeaders: ["Subject", "Date"],
          });

          const headers = detail.data.payload?.headers ?? [];
          const subject =
            headers.find((h) => h.name === "Subject")?.value ?? "(no subject)";
          const dateStr = headers.find((h) => h.name === "Date")?.value;
          const date = dateStr ? new Date(dateStr) : new Date();

          await prisma.interaction.create({
            data: {
              contactId: contact.id,
              type: "email",
              date: isNaN(date.getTime()) ? new Date() : date,
              notes: `Email: ${subject} [id:${msg.id}]`,
            },
          });
          result.interactionsLogged++;
        }
      } catch {
        // Skip individual contact errors silently
      }
    }
  } catch (err) {
    result.errors.push(`Gmail sync error: ${String(err)}`);
  }

  return result;
}
