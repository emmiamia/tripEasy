"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiMail, FiSend, FiShield, FiUserPlus } from "react-icons/fi";

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  invitedAt: string | Date;
}

interface TripCollaboratorsPanelProps {
  tripId: string;
  members: Member[];
  invites: Invite[];
  currentRole: string;
}

const roleOptions = [
  { value: "OWNER", label: "Owner", helper: "Full access & manage members" },
  { value: "EDITOR", label: "Editor", helper: "Update itineraries and logistics" },
  { value: "VIEWER", label: "Viewer", helper: "Read-only access" }
];

export function TripCollaboratorsPanel({
  tripId,
  members,
  invites,
  currentRole
}: TripCollaboratorsPanelProps) {
  const canInvite = currentRole === "OWNER" || currentRole === "EDITOR";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setError(null);
    try {
      const response = await fetch(`/api/trips/${tripId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role })
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error ?? "Unable to send invite");
      }

      setStatus("success");
      setEmail("");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Unable to send invite");
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Collaboration</p>
          <h3 className="text-lg font-semibold text-slate-900">Trip members</h3>
        </div>
        <div className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
          {members.length} members
        </div>
      </header>

      <div className="mt-4 space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-semibold text-slate-900">{member.user.name ?? member.user.email}</p>
              <p className="text-xs text-slate-500">{member.user.email}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              <FiShield className="h-3.5 w-3.5 text-brand-500" />
              {member.role.toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      {invites.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending invites</p>
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-600"
            >
              <div className="flex items-center gap-2">
                <FiMail className="h-4 w-4 text-brand-500" />
                <div>
                  <p className="font-semibold text-slate-900">{invite.email}</p>
                  <p className="text-xs text-slate-500">{invite.role.toLowerCase()}</p>
                </div>
              </div>
              <span className="text-xs uppercase tracking-wide text-slate-500">{invite.status}</span>
            </div>
          ))}
        </div>
      )}

      {canInvite && (
        <form onSubmit={handleInvite} className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <FiUserPlus className="h-3.5 w-3.5 text-brand-500" />
            Invite collaborator
          </p>
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-60"
          >
            <FiSend className="h-4 w-4" />
            {status === "loading" ? "Sending…" : "Send invite"}
          </button>
          {status === "success" && <p className="text-xs text-emerald-600">Invite sent.</p>}
        </form>
      )}
    </div>
  );
}

