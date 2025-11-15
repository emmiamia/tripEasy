"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FiMail, FiMapPin, FiShield, FiUsers } from "react-icons/fi";

interface AcceptInviteCardProps {
  invite: {
    token: string;
    email: string;
    tripName: string;
    destination: string | null;
    role: string;
    status: string;
    invitedBy: string;
  };
}

export function AcceptInviteCard({ invite }: AcceptInviteCardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/invites/${invite.token}`, {
        method: "POST"
      });

      if (!response.ok) {
        const json = await response.json();
        setError(json.error ?? "Unable to accept invite");
        return;
      }

      const result = await response.json();
      router.push(`/trips/${result.tripId}`);
      router.refresh();
    });
  };

  const isProcessed = invite.status !== "pending";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Trip invitation</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{invite.tripName}</h1>
      {invite.destination && (
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <FiMapPin className="h-4 w-4 text-brand-500" />
          {invite.destination}
        </div>
      )}

      <div className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <FiUsers className="h-4 w-4 text-brand-500" />
          {invite.invitedBy} invited you to collaborate
        </div>
        <div className="flex items-center gap-2">
          <FiMail className="h-4 w-4 text-brand-500" />
          Sent to {invite.email}
        </div>
        <div className="flex items-center gap-2">
          <FiShield className="h-4 w-4 text-brand-500" />
          Role: {invite.role.toLowerCase()}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {isProcessed ? (
          <p className="text-sm text-slate-600">
            This invite has already been {invite.status}. You can head to your trips dashboard.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleAccept}
            disabled={isPending}
            className="w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Accepting..." : "Accept invite"}
          </button>
        )}
      </div>
    </div>
  );
}

