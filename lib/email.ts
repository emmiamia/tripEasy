import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.INVITE_FROM_EMAIL;
const appUrl = process.env.APP_URL ?? "http://localhost:3000";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface TripInviteEmailPayload {
  to: string;
  token: string;
  tripName: string;
  invitedBy: string;
}

export async function sendTripInviteEmail(payload: TripInviteEmailPayload) {
  if (!resend || !fromEmail) {
    throw new Error(
      "Missing RESEND_API_KEY or INVITE_FROM_EMAIL. Unable to send collaboration invite email."
    );
  }

  const inviteLink = `${appUrl}/invites/${payload.token}`;
  const subject = `${payload.invitedBy} invited you to collaborate on ${payload.tripName}`;
  const text = [
    `Hi,`,
    ``,
    `${payload.invitedBy} invited you to collaborate on "${payload.tripName}" in TripEasy.`,
    `Click the link below to accept:`,
    inviteLink,
    ``,
    `If you don't have an account yet, you'll be asked to register first.`,
    ``,
    `Happy travels!`
  ].join("\n");

  await resend.emails.send({
    from: fromEmail,
    to: payload.to,
    subject,
    text,
    html: `<p>${payload.invitedBy} invited you to collaborate on <strong>${payload.tripName}</strong>.</p><p><a href="${inviteLink}" target="_blank" rel="noopener noreferrer">Accept the invite</a></p><p>If you don't have an account yet, you'll be asked to register first.</p>`
  });
}

