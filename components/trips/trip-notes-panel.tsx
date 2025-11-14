"use client";

import { useState } from "react";
import { FiSend } from "react-icons/fi";
import type { TripWithRelations } from "@/lib/trips";

interface TripNotesPanelProps {
  tripId: string;
  notes: TripWithRelations["notes"];
}

export function TripNotesPanel({ tripId, notes }: TripNotesPanelProps) {
  const [entries, setEntries] = useState(notes);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, content })
      });
      if (!response.ok) throw new Error("Failed to add note");
      const note = await response.json();
      setEntries((prev) => [note, ...prev]);
      setContent("");
    } catch (error) {
      console.error(error);
      alert("Unable to save note.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Collaboration</p>
        <h2 className="text-lg font-semibold text-slate-900">Trip notebook</h2>
      </header>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
          placeholder="Share reminders, links, or brainstorm ideas."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            <FiSend className="h-4 w-4" />
            Add note
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {entries.map((note) => (
          <article key={note.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <p>{note.content}</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
              {new Date(note.createdAt).toLocaleString()}
            </p>
          </article>
        ))}
        {!entries.length && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
            Keep your fellow travelers in sync by adding a note.
          </p>
        )}
      </div>
    </section>
  );
}
