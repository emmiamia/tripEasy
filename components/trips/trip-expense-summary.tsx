"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TripWithRelations } from "@/lib/trips";
import { currencyFormatter } from "@/lib/utils";
import { FiDollarSign, FiPlus } from "react-icons/fi";

interface TripExpenseSummaryProps {
  tripId: string;
  expenses: TripWithRelations["expenses"];
  currency: string;
}

const CATEGORY_OPTIONS = [
  { value: "TRANSPORT", label: "Transport" },
  { value: "LODGING", label: "Lodging" },
  { value: "ACTIVITIES", label: "Activities" },
  { value: "FOOD", label: "Food & Dining" },
  { value: "SHOPPING", label: "Shopping" },
  { value: "MISC", label: "Miscellaneous" }
];

export function TripExpenseSummary({ tripId, expenses, currency }: TripExpenseSummaryProps) {
  const router = useRouter();
  const [entries, setEntries] = useState(expenses);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const formatter = useMemo(() => currencyFormatter(currency), [currency]);

  const totals = useMemo(() => {
    const total = entries.reduce((acc: number, expense: TripWithRelations["expenses"][number]) => acc + expense.amount, 0);
    const categories = entries.reduce<Record<string, number>>((acc: Record<string, number>, expense: TripWithRelations["expenses"][number]) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
      return acc;
    }, {});

    const grouped = entries
      .slice()
      .sort(
        (a: TripWithRelations["expenses"][number], b: TripWithRelations["expenses"][number]) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .reduce<Record<string, TripWithRelations["expenses"][number][]>>(
        (acc: Record<string, TripWithRelations["expenses"][number][]>, expense: TripWithRelations["expenses"][number]) => {
        acc[expense.category] = acc[expense.category] ?? [];
        acc[expense.category]!.push(expense);
        return acc;
        },
        {}
      );

    return { total, categories, grouped };
  }, [entries]);

  const handleAddExpense = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!description.trim() || !amount) return;

    setLoading(true);
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          description,
          amount: Number(amount),
          category,
          currency,
          date: date || new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error("Failed to create expense");
      const expense = await response.json();
      setEntries((prev: TripWithRelations["expenses"]) => [expense, ...prev]);
      setDescription("");
      setAmount("");
      setDate("");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Unable to create expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Budget</p>
          <h2 className="text-lg font-semibold text-slate-900">Expense tracker</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          <FiDollarSign className="h-4 w-4" /> {formatter.format(totals.total)}
        </span>
      </header>

      <form onSubmit={handleAddExpense} className="mt-4 space-y-3">
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Sushi dinner"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <div className="grid gap-3 grid-cols-[1fr_1fr]">
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            step="0.01"
            placeholder="Amount"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <input
            value={date}
            onChange={(event) => setDate(event.target.value)}
            type="date"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
        >
          <FiPlus className="h-4 w-4" /> Add expense
        </button>
      </form>

      <div className="mt-6 space-y-4 text-xs text-slate-600">
        {Object.entries(totals.grouped).map(([categoryKey, expensesByCategory]) => {
          const categoryMeta = CATEGORY_OPTIONS.find((option) => option.value === categoryKey);
          const label = categoryMeta?.label ?? categoryKey;
          const categoryTotal = totals.categories[categoryKey] ?? 0;
          const isOpen = expandedCategories[categoryKey] ?? false;

          return (
            <div key={categoryKey} className="rounded-2xl bg-slate-50 p-4">
              <button
                type="button"
                onClick={() =>
                  setExpandedCategories((prev) => ({
                    ...prev,
                    [categoryKey]: !isOpen
                  }))
                }
                className="mb-3 flex w-full items-center justify-between text-left text-sm font-semibold text-slate-800"
              >
                <span>{label}</span>
                <span className="flex items-center gap-2">
                  {formatter.format(categoryTotal)}
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                    {isOpen ? "Hide" : "Show"}
                  </span>
                </span>
              </button>
              {isOpen && (
                <div className="space-y-2">
                  {(expensesByCategory as TripWithRelations["expenses"][number][]).map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-[11px] text-slate-600"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{expense.description}</p>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">
                          {new Date(expense.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      <span className="font-semibold text-slate-800">{formatter.format(expense.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {!entries.length && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
            Track spending to keep your budget in sight.
          </p>
        )}
      </div>
    </section>
  );
}
