"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripSchema } from "@/lib/validation";
import { z } from "zod";
import { FiCalendar, FiCheckCircle } from "react-icons/fi";

const formSchema = tripSchema.pick({
  name: true,
  destination: true,
  startDate: true,
  endDate: true,
  travelStyle: true,
  description: true,
  coverImage: true,
  currency: true
});

type FormValues = z.infer<typeof formSchema>;

export function NewTripForm() {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      travelStyle: "ADVENTURE",
      currency: "USD"
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!response.ok) {
        throw new Error("Failed to create trip");
      }
      const trip = await response.json();
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      console.error(error);
      alert("Unable to create trip. Please try again.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Trip name" error={errors.name?.message}>
          <input
            {...register("name")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="Cherry blossoms in Japan"
          />
        </FormField>
        <FormField label="Destination" error={errors.destination?.message}>
          <input
            {...register("destination")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="Tokyo, Kyoto"
          />
        </FormField>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Start date" error={errors.startDate?.message}>
          <div className="relative">
            <FiCalendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              {...register("startDate")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </FormField>
        <FormField label="End date" error={errors.endDate?.message}>
          <div className="relative">
            <FiCalendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              {...register("endDate")}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
        </FormField>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Travel style" error={errors.travelStyle?.message}>
          <select
            {...register("travelStyle")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            <option value="ADVENTURE">Adventure</option>
            <option value="CULTURE">Culture</option>
            <option value="RELAXATION">Relaxation</option>
            <option value="FAMILY">Family</option>
            <option value="LUXURY">Luxury</option>
            <option value="ROAD_TRIP">Road trip</option>
          </select>
        </FormField>
        <FormField label="Currency" error={errors.currency?.message}>
          <input
            {...register("currency")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="USD"
            maxLength={3}
          />
        </FormField>
      </div>

      <FormField label="Cover image URL" error={errors.coverImage?.message}>
        <input
          {...register("coverImage")}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
          placeholder="https://"
        />
      </FormField>

      <FormField label="Trip notes" error={errors.description?.message}>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
          placeholder="What excites you most about this adventure?"
        />
      </FormField>

      <div className="flex flex-col items-center gap-3 rounded-2xl bg-brand-50 p-5 text-sm text-brand-700">
        <FiCheckCircle className="h-5 w-5" />
        We will pre-populate your itinerary with daily placeholders that you can edit later.
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-white shadow hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
      >
        {isSubmitting ? "Creating trip..." : "Create trip"}
      </button>
    </form>
  );
}

function FormField({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      {children}
      {error && <span className="block text-xs text-rose-500">{error}</span>}
    </label>
  );
}
