import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL ?? "reminders@yourdomain.com";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendReminderEmail({
  to,
  medicationName,
  dosage,
  locale = "en",
}: {
  to: string;
  medicationName: string;
  dosage: string;
  locale?: string;
}) {
  const isFr = locale === "fr";

  const safeName = escapeHtml(medicationName);
  const safeDosage = escapeHtml(dosage);

  const subject = isFr
    ? `Rappel : ${medicationName}`
    : `Reminder: ${medicationName}`;

  const heading = isFr
    ? `Il est temps de prendre votre médicament`
    : `Time to take your medication`;

  const body = isFr
    ? `<strong>${safeName}</strong> — ${safeDosage}`
    : `<strong>${safeName}</strong> — ${safeDosage}`;

  const footer = isFr
    ? `Ce message a été envoyé automatiquement par Health Tracker.`
    : `This message was sent automatically by Health Tracker.`;

  const html = `<!DOCTYPE html>
<html lang="${isFr ? "fr" : "en"}">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#0a120b;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#111a12;border-radius:12px;border:1px solid #1e3020;padding:36px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#5a8a5a;">Health Tracker</p>
          <h1 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#c5dfc0;">${heading}</h1>
          <div style="background:#162018;border:1px solid #253525;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0;font-size:16px;color:#e0f0dc;">${body}</p>
          </div>
          <p style="margin:0;font-size:12px;color:#4a6a4a;">${footer}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({ from: FROM, to, subject, html });
}
