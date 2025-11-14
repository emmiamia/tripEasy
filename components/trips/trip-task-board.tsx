"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { TripWithRelations } from "@/lib/trips";
import { FiPlus, FiCheckSquare, FiSquare } from "react-icons/fi";

interface TripTaskBoardProps {
  tripId: string;
  tasks: TripWithRelations["tasks"];
  upcoming: TripWithRelations["tasks"];
}

export function TripTaskBoard({ tripId, tasks, upcoming }: TripTaskBoardProps) {
  const [items, setItems] = useState(tasks);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const nextDue = upcoming.filter((task) => !task.isComplete)[0];

  const toggleTask = async (taskId: string, isComplete: boolean) => {
    setItems((prev) => prev.map((task) => (task.id === taskId ? { ...task, isComplete } : task)));
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isComplete })
      });
    } catch (error) {
      console.error(error);
      alert("Unable to update task state");
    }
  };

  const handleAddTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, title, dueDate: dueDate || undefined })
      });
      if (!response.ok) throw new Error("Failed to create task");
      const task = await response.json();
      setItems((prev) => [task, ...prev]);
      setTitle("");
      setDueDate("");
    } catch (error) {
      console.error(error);
      alert("Unable to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Preparation</p>
          <h2 className="text-lg font-semibold text-slate-900">Trip checklist</h2>
        </div>
      </header>

      <form onSubmit={handleAddTask} className="mt-4 space-y-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Book car rental"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
        >
          <FiPlus className="h-4 w-4" /> Add task
        </button>
      </form>

      {nextDue && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          Next due: <strong>{nextDue.title}</strong> on {nextDue.dueDate ? format(new Date(nextDue.dueDate), "MMM d") : "TBD"}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {items.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id, !task.isComplete)}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600 hover:border-brand-200"
          >
            <span className="flex items-center gap-3">
              {task.isComplete ? (
                <FiCheckSquare className="h-4 w-4 text-emerald-500" />
              ) : (
                <FiSquare className="h-4 w-4 text-slate-400" />
              )}
              <span className={task.isComplete ? "text-slate-400 line-through" : "text-slate-700"}>
                {task.title}
              </span>
            </span>
            <span className="text-xs text-slate-400">
              {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "No due date"}
            </span>
          </button>
        ))}
        {!items.length && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
            Add to-dos to stay on top of reservations and prep work.
          </p>
        )}
      </div>
    </section>
  );
}
