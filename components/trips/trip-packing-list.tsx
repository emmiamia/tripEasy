"use client";

import { useState } from "react";
import type { TripWithRelations } from "@/lib/trips";
import { FiCheck, FiPlus, FiTag } from "react-icons/fi";

interface TripPackingListProps {
  tripId: string;
  items: TripWithRelations["packingItems"];
}

export function TripPackingList({ tripId, items }: TripPackingListProps) {
  const [packingItems, setPackingItems] = useState(items);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Essentials");
  const [loading, setLoading] = useState(false);

  const togglePacked = async (itemId: string, isPacked: boolean) => {
    setPackingItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, isPacked } : item)));
    try {
      await fetch(`/api/packing-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPacked })
      });
    } catch (error) {
      console.error(error);
      alert("Unable to update packing item");
    }
  };

  const addItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/packing-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, name, category })
      });
      if (!response.ok) throw new Error("Failed to create item");
      const item = await response.json();
      setPackingItems((prev) => [item, ...prev]);
      setName("");
    } catch (error) {
      console.error(error);
      alert("Unable to create packing item");
    } finally {
      setLoading(false);
    }
  };

  const sections = packingItems.reduce<Record<string, typeof packingItems>>((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Packing</p>
          <h2 className="text-lg font-semibold text-slate-900">Checklist</h2>
        </div>
      </header>

      <form onSubmit={addItem} className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Travel adapter"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
        >
          <FiPlus className="h-4 w-4" /> Add item
        </button>
      </form>

      <div className="mt-6 space-y-4 text-sm">
        {Object.entries(sections).map(([section, list]) => (
          <div key={section} className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <FiTag className="h-3.5 w-3.5 text-brand-500" />
              {section}
            </h3>
            <div className="space-y-2">
              {list.map((item) => (
                <button
                  key={item.id}
                  onClick={() => togglePacked(item.id, !item.isPacked)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600 hover:border-brand-200"
                >
                  <span className={item.isPacked ? "text-slate-400 line-through" : "text-slate-700"}>
                    {item.name}
                  </span>
                  {item.isPacked && <FiCheck className="h-4 w-4 text-emerald-500" />}
                </button>
              ))}
            </div>
          </div>
        ))}
        {!packingItems.length && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
            Build your packing list to share with companions.
          </p>
        )}
      </div>
    </section>
  );
}
