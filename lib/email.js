/**
 * Email — STUBBED. There is no real email provider wired up here.
 * ------------------------------------------------------------------
 * This demo has no backend, so it cannot actually deliver email. What it
 * does instead: builds the exact message that would be sent, "delivers"
 * it into a local outbox (localStorage), and returns it so the UI can show
 * the person what they'd have received — every registration/add-tenant
 * confirmation screen does this.
 *
 * To make this real: stand up a server route (Next.js Route Handler is
 * fine) that calls a provider like Resend or SendGrid, and replace the
 * body of `sendWelcomeEmail` with a fetch() to that route. Nothing else
 * in the app needs to change — every call site already awaits this
 * function and only cares about the returned `message`.
 */

const OUTBOX_KEY = "ile-surulere-outbox-v1";

function hasStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function loadOutbox() {
  if (!hasStorage()) return [];
  return JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]");
}

function saveOutbox(outbox) {
  if (!hasStorage()) return;
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
}

export function getOutbox() {
  return loadOutbox().slice().reverse();
}

function buildWelcomeEmail({ to, name, idLabel, idValue, tempPassword, intro }) {
  return {
    id: "mail-" + Date.now(),
    to,
    subject: "Your Ilé Surulere login details",
    sentAt: new Date().toISOString(),
    body:
      `Hi ${name},\n\n` +
      `${intro}\n\n` +
      (idLabel && idValue ? `${idLabel}: ${idValue}\n` : "") +
      `Login email: ${to}\n` +
      `Temporary password: ${tempPassword}\n\n` +
      `Log in at /login with the email and temporary password above, ` +
      `then change your password from your dashboard.\n\n` +
      `If this wasn't you, contact your CDA or the LG Secretariat.\n\n` +
      `— Ilé Surulere`,
  };
}

/**
 * "Sends" a welcome/notification email. Always succeeds in this demo (no
 * network call to fail). Returns the message that was built, so callers
 * can show it on a confirmation screen.
 */
export async function sendWelcomeEmail({ to, name, idLabel, idValue, tempPassword, intro }) {
  const message = buildWelcomeEmail({ to, name, idLabel, idValue, tempPassword, intro });
  const outbox = loadOutbox();
  outbox.push(message);
  saveOutbox(outbox);
  return { ok: true, message };
}
