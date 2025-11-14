import { NewTripForm } from "@/components/trips/new-trip-form";

export default function NewTripPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Create</p>
        <h1 className="text-3xl font-bold text-slate-900">Plan a new trip</h1>
        <p className="text-sm text-slate-600">
          Set the basics for your itinerary and we will pre-build an editable daily plan.
        </p>
      </header>
      <NewTripForm />
    </section>
  );
}
