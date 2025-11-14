"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { TripWithRelations } from "@/lib/trips";
import { FiEdit2, FiExternalLink, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { LocationCombobox, LocationOption } from "@/components/location/location-combobox";

interface TripItineraryProps {
  tripId: string;
  days: TripWithRelations["days"];
}

type ActivityEntity = TripWithRelations["days"][number]["activities"][number];
type TripDayEntity = TripWithRelations["days"][number];

type ActivityDraft = {
  title: string;
  subtitle: string;
  startTime: string;
  endTime: string;
  cityText: string;
  cityOption: LocationOption | null;
  address: string;
  locationLat: number | null;
  locationLng: number | null;
  notes: string;
};

type DayDraft = {
  summary: string;
  date: string;
};

const emptyActivityDraft: ActivityDraft = {
  title: "",
  subtitle: "",
  startTime: "",
  endTime: "",
  cityText: "",
  cityOption: null,
  address: "",
  locationLat: null,
  locationLng: null,
  notes: ""
};

const emptyDayDraft: DayDraft = {
  summary: "",
  date: ""
};

const formatTimeInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export function TripItinerary({ tripId, days }: TripItineraryProps) {
  const [itineraryDays, setItineraryDays] = useState<TripWithRelations["days"]>(days);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ActivityDraft>(emptyActivityDraft);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [isSavingActivity, setSavingActivity] = useState(false);
  const [isAddingDay, setIsAddingDay] = useState(false);

  const [dayEditingId, setDayEditingId] = useState<string | null>(null);
  const [dayDraft, setDayDraft] = useState<DayDraft>(emptyDayDraft);
  const [isSavingDay, setSavingDay] = useState(false);
  const dayLookup = useMemo<Map<string, TripDayEntity>>(
    () => new Map(itineraryDays.map((day: TripDayEntity) => [day.id, day] as const)),
    [itineraryDays]
  );

  useEffect(() => {
    setItineraryDays(days);
  }, [days]);

  const openForm = (dayId: string) => {
    setActiveDayId(dayId);
    setEditingActivityId(null);
    setDraft(emptyActivityDraft);
  };

  const startEditActivity = (dayId: string, activity: ActivityEntity) => {
    setActiveDayId(dayId);
    setEditingActivityId(activity.id);
    setDraft({
      title: activity.title,
      subtitle: activity.subtitle ?? "",
      startTime: formatTimeInput(activity.startTime),
      endTime: formatTimeInput(activity.endTime),
      cityText: activity.locationCity ?? "",
      cityOption: activity.locationCity
        ? {
            placeId: activity.id,
            description: activity.locationCity
          }
        : null,
      locationLat: activity.locationLat ?? null,
      locationLng: activity.locationLng ?? null,
      address: activity.locationName ?? "",
      notes: activity.notes ?? ""
    });
    setExpandedActivityId(activity.id);
  };

  const closeForm = () => {
    setActiveDayId(null);
    setEditingActivityId(null);
    setDraft(emptyActivityDraft);
    setSavingActivity(false);
  };

  const handleDraftChange = (field: keyof ActivityDraft, value: string) => {
    setDraft((prev: ActivityDraft) => {
      const next = { ...prev, [field]: value } as ActivityDraft;
      if (field === "address") {
        next.locationLat = null;
        next.locationLng = null;
      }
      return next;
    });
  };

  const handleCityInputChange = (value: string) => {
    setDraft((prev: ActivityDraft) => ({
      ...prev,
      cityText: value,
      cityOption: null
    }));
  };

  const handleCitySelect = (option: LocationOption | null) => {
    setDraft((prev: ActivityDraft) => ({
      ...prev,
      cityText: option?.description ?? prev.cityText,
      cityOption: option
    }));
  };

  const handleAddDay = async () => {
    if (isAddingDay) return;

    const resolvedTripId = tripId ?? itineraryDays[0]?.tripId ?? null;
    if (!resolvedTripId) {
      alert("Trip information is missing; unable to add a new day.");
      return;
    }

    setIsAddingDay(true);
    try {
      const lastDay = itineraryDays.reduce<TripDayEntity | null>((latest: TripDayEntity | null, current: TripDayEntity) => {
        const latestDate = latest ? new Date(latest.date) : null;
        const currentDate = new Date(current.date);
        if (!latest) return current;
        return currentDate > (latestDate ?? currentDate) ? current : latest;
      }, null);

      const newDate = lastDay ? addDays(new Date(lastDay.date), 1) : new Date();

      const response = await fetch("/api/trip-days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: resolvedTripId,
          date: newDate.toISOString(),
          summary: null
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create trip day");
      }

      const tripDay: TripDayEntity = await response.json();

      setItineraryDays((prevDays: TripWithRelations["days"]) =>
        [...prevDays, tripDay].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );

      setDayEditingId(tripDay.id);
      setDayDraft({
        summary: tripDay.summary ?? "",
        date: format(new Date(tripDay.date), "yyyy-MM-dd")
      });
      setActiveDayId(tripDay.id);
      setExpandedActivityId(null);
    } catch (error) {
      console.error(error);
      alert("Unable to add a new day. Please try again.");
    } finally {
      setIsAddingDay(false);
    }
  };

  const combineDateTime = (dayId: string, time: string | null) => {
    if (!time) return null;
    const day = dayLookup.get(dayId);
    if (!day) return null;
    const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10));
    const date = new Date(day.date);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return null;
    }
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, dayId: string) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setSavingActivity(true);

    const city = draft.cityOption?.description ?? draft.cityText.trim();
    const startTimeISO = draft.startTime ? combineDateTime(dayId, draft.startTime) : null;
    const endTimeISO = draft.endTime ? combineDateTime(dayId, draft.endTime) : null;
    const locationName = draft.address.trim();

    let locationLat = draft.locationLat;
    let locationLng = draft.locationLng;

    if ((locationLat == null || locationLng == null) && locationName) {
      try {
        const params = new URLSearchParams({ address: locationName });
        if (city) {
          params.set("city", city);
        }
        const geocodeResponse = await fetch(`/api/places/geocode?${params.toString()}`);
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData?.location) {
            locationLat = geocodeData.location.lat ?? locationLat;
            locationLng = geocodeData.location.lng ?? locationLng;
          }
        }
      } catch (error) {
        console.error("[TripItinerary] geocode error", error);
      }
    }

    if (
      (locationLat == null || locationLng == null) &&
      draft.cityOption?.lat != null &&
      draft.cityOption?.lng != null
    ) {
      locationLat = draft.cityOption.lat;
      locationLng = draft.cityOption.lng;
    }

    const payload = {
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || null,
      startTime: startTimeISO,
      endTime: endTimeISO,
      locationCity: city || null,
      locationName: locationName || null,
      locationLat: typeof locationLat === "number" ? locationLat : undefined,
      locationLng: typeof locationLng === "number" ? locationLng : undefined,
      notes: draft.notes.trim() || null
    };

    try {
      const response = await fetch(
        editingActivityId ? `/api/activities/${editingActivityId}` : "/api/activities",
        {
          method: editingActivityId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingActivityId ? payload : { ...payload, dayId })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save activity");
      }

      const activity: ActivityEntity & { dayId: string } = await response.json();

      setItineraryDays((prev: TripWithRelations["days"]) => {
        let next = prev.map((day: TripDayEntity) => {
          if (day.id !== activity.dayId) return day;
          const updatedActivities = editingActivityId
            ? day.activities
                .map((existing: ActivityEntity) =>
                  existing.id === activity.id ? { ...existing, ...activity } : existing
                )
                .sort((a: ActivityEntity, b: ActivityEntity) => {
                  const aTime = a.startTime ? new Date(a.startTime).getTime() : Number.POSITIVE_INFINITY;
                  const bTime = b.startTime ? new Date(b.startTime).getTime() : Number.POSITIVE_INFINITY;
                  return aTime - bTime;
                })
            : [...day.activities, activity].sort((a: ActivityEntity, b: ActivityEntity) => {
                const aTime = a.startTime ? new Date(a.startTime).getTime() : Number.POSITIVE_INFINITY;
                const bTime = b.startTime ? new Date(b.startTime).getTime() : Number.POSITIVE_INFINITY;
                return aTime - bTime;
              });
          return { ...day, activities: updatedActivities };
        });

        if (editingActivityId) {
          next = next.map((day: TripDayEntity) => {
            if (day.id === dayId && day.id !== activity.dayId) {
              return {
                ...day,
                activities: day.activities.filter((existing: ActivityEntity) => existing.id !== activity.id)
              };
            }
            return day;
          });
        }

        return next;
      });

      setExpandedActivityId(activity.id);
      closeForm();
    } catch (error) {
      console.error(error);
      alert("Unable to save activity. Please try again.");
      setSavingActivity(false);
    }
  };

  const toggleActivityDetails = (activityId: string) => {
    setExpandedActivityId((prev) => (prev === activityId ? null : activityId));
  };

  const handleActivityDelete = async (dayId: string, activityId: string) => {
    const confirmed = window.confirm("Delete this activity? This cannot be undone.");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/activities/${activityId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete activity");
      }
      setItineraryDays((prev: TripWithRelations["days"]) =>
        prev.map((day: TripDayEntity) =>
          day.id === dayId
            ? { ...day, activities: day.activities.filter((activity: ActivityEntity) => activity.id !== activityId) }
            : day
        )
      );
      setExpandedActivityId((prev: string | null) => (prev === activityId ? null : prev));
      if (editingActivityId === activityId) {
        closeForm();
      }
    } catch (error) {
      console.error(error);
      alert("Unable to delete activity. Please try again.");
    }
  };

  const startEditDay = (dayId: string) => {
    const day = dayLookup.get(dayId);
    if (!day) return;
    setDayEditingId(dayId);
    setDayDraft({
      summary: day.summary ?? "",
      date: format(new Date(day.date), "yyyy-MM-dd")
    });
  };

  const cancelDayEdit = () => {
    setDayEditingId(null);
    setDayDraft(emptyDayDraft);
    setSavingDay(false);
  };

  const handleDayFieldChange = (field: keyof DayDraft, value: string) => {
    setDayDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDay = async (dayId: string) => {
    if (!dayDraft.date) {
      alert("Please choose a date.");
      return;
    }
    setSavingDay(true);
    try {
      const response = await fetch(`/api/trip-days/${dayId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: dayDraft.summary.trim() || null,
          date: dayDraft.date
        })
      });
      if (!response.ok) {
        throw new Error("Failed to update day");
      }
      const updatedDay: { id: string; summary: string | null; date: string } = await response.json();

      setItineraryDays((prev: TripWithRelations["days"]) =>
        prev
          .map((day: TripDayEntity) =>
            day.id === dayId ? { ...day, summary: updatedDay.summary, date: updatedDay.date } : day
          )
          .sort((a: TripDayEntity, b: TripDayEntity) => new Date(a.date).getTime() - new Date(b.date).getTime())
      );
      cancelDayEdit();
    } catch (error) {
      console.error(error);
      alert("Unable to update day. Please try again.");
      setSavingDay(false);
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    const confirmed = window.confirm("Delete this day and all its activities?");
    if (!confirmed) return;
    const day = dayLookup.get(dayId);
    try {
      const response = await fetch(`/api/trip-days/${dayId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete day");
      }
      setItineraryDays((prev: TripWithRelations["days"]) => prev.filter((day: TripDayEntity) => day.id !== dayId));
      if (activeDayId === dayId) {
        closeForm();
      }
      if (dayEditingId === dayId) {
        cancelDayEdit();
      }
      if (day) {
        setExpandedActivityId((prev: string | null) =>
          day.activities.some((activity: ActivityEntity) => activity.id === prev) ? null : prev
        );
      }
    } catch (error) {
      console.error(error);
      alert("Unable to delete day. Please try again.");
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Daily plan</p>
          <h2 className="text-lg font-semibold text-slate-900">Itinerary timeline</h2>
        </div>
        <button
          type="button"
          onClick={handleAddDay}
          disabled={isAddingDay}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-brand-200 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiPlus className="h-4 w-4" /> {isAddingDay ? "Adding..." : "Add day"}
        </button>
      </header>
      <div className="mt-6 space-y-6">
        {itineraryDays.map((day: TripDayEntity, index: number) => {
          const isActive = activeDayId === day.id;
          const isEditingDay = dayEditingId === day.id;

          return (
          <div key={day.id} className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600">
                D{index + 1}
              </div>
                <div className="flex flex-1 flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {format(new Date(day.date), "EEEE, MMM d")}
                </p>
                {day.summary && <p className="text-sm text-slate-600">{day.summary}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => (isActive ? closeForm() : openForm(day.id))}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-500 hover:border-brand-200 hover:text-brand-600"
                    >
                      {isActive ? (
                        <>
                          <FiX className="h-4 w-4" /> Cancel
                        </>
                      ) : (
                        <>
                          <FiPlus className="h-4 w-4" /> Add activity
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => (isEditingDay ? cancelDayEdit() : startEditDay(day.id))}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-500 hover:border-brand-200 hover:text-brand-600"
                    >
                      <FiEdit2 className="h-4 w-4" /> {isEditingDay ? "Cancel edit" : "Edit day"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDay(day.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-2 text-[11px] font-semibold text-rose-500 hover:border-rose-300 hover:text-rose-600"
                    >
                      <FiTrash2 className="h-4 w-4" /> Delete day
                    </button>
                  </div>
              </div>
            </div>

              {isEditingDay && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSaveDay(day.id);
                  }}
                  className="ml-[52px] space-y-3 rounded-2xl border border-brand-200 bg-white p-4 text-xs shadow-sm"
                >
                  <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                    <label className="space-y-1">
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </span>
                      <input
                        type="date"
                        value={dayDraft.date}
                        onChange={(event) => handleDayFieldChange("date", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Summary
                      </span>
                      <textarea
                        rows={2}
                        value={dayDraft.summary}
                        onChange={(event) => handleDayFieldChange("summary", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        placeholder="Morning travel, afternoon activities..."
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={cancelDayEdit}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:border-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingDay}
                      className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
                    >
                      {isSavingDay ? "Saving..." : "Save day"}
                    </button>
                  </div>
                </form>
              )}

            <div className="space-y-3 border-l-2 border-dashed border-slate-200 pl-6">
                {day.activities.map((activity: ActivityEntity) => {
                  const isExpanded = expandedActivityId === activity.id;
                  const isEditingThisActivity = editingActivityId === activity.id;

                  return (
                    <div key={activity.id} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleActivityDetails(activity.id)}
                        className={`relative w-full rounded-2xl border px-4 py-4 text-left text-sm shadow-sm transition-colors ${
                          isExpanded
                            ? "border-brand-200 bg-white"
                            : "border-slate-100 bg-slate-50 hover:border-brand-200"
                        }`}
                >
                  <span className="absolute -left-[31px] top-5 h-3 w-3 rounded-full border-4 border-white bg-brand-500" />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {activity.title}
                        {activity.locationCity && (
                          <span className="ml-2 text-brand-600">{activity.locationCity}</span>
                        )}
                      </p>
                      {activity.subtitle && <p className="text-xs text-slate-500">{activity.subtitle}</p>}
                    </div>
                    <div className="text-xs text-slate-500">
                      {activity.startTime && format(new Date(activity.startTime), "HH:mm")}
                      {activity.endTime ? ` – ${format(new Date(activity.endTime), "HH:mm")}` : null}
                    </div>
                  </div>
                      </button>

                      {isExpanded && !isEditingThisActivity && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="font-semibold uppercase tracking-wide text-slate-500">Location</p>
                              {activity.locationCity && (
                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                  City: <span className="text-brand-600">{activity.locationCity}</span>
                    </p>
                  )}
                              {activity.locationName ? (
                                <>
                                  <p className="mt-1 text-sm text-slate-700">{activity.locationName}</p>
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <a
                                      href={
                                        activity.locationLat != null && activity.locationLng != null
                                          ? `https://www.google.com/maps/dir/?api=1&destination=${activity.locationLat},${activity.locationLng}`
                                          : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                              activity.locationName
                                            )}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-3 py-2 text-[11px] font-semibold text-brand-600 hover:border-brand-300 hover:text-brand-700"
                                    >
                                      <FiExternalLink className="h-4 w-4" />
                                      Get directions
                                    </a>
                                  </div>
                                </>
                              ) : (
                                <p className="mt-1 text-sm text-slate-700">Not set</p>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold uppercase tracking-wide text-slate-500">Timing</p>
                              <p className="mt-1 text-sm text-slate-700">
                                {activity.startTime
                                  ? format(new Date(activity.startTime), "MMM d • HH:mm")
                                  : "Start time TBD"}
                                {activity.endTime
                                  ? ` → ${format(new Date(activity.endTime), "HH:mm")}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          {activity.notes && (
                            <div className="mt-4">
                              <p className="font-semibold uppercase tracking-wide text-slate-500">Notes</p>
                              <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{activity.notes}</p>
                            </div>
                          )}
                          <div className="mt-4 flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEditActivity(day.id, activity)}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-500 hover:border-brand-200 hover:text-brand-600"
                            >
                              <FiEdit2 className="h-4 w-4" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleActivityDelete(day.id, activity.id)}
                              className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-2 text-[11px] font-semibold text-rose-500 hover:border-rose-300 hover:text-rose-600"
                            >
                              <FiTrash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isActive && (
                  <form
                    onSubmit={(event) => handleSubmit(event, day.id)}
                    className="space-y-3 rounded-2xl border border-brand-200 bg-white p-4 text-xs shadow-sm"
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1">
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Title
                        </span>
                        <input
                          value={draft.title}
                          onChange={(event) => handleDraftChange("title", event.target.value)}
                          required
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                          placeholder="Visit Senso-ji Temple"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Subtitle
                        </span>
                        <input
                          value={draft.subtitle}
                          onChange={(event) => handleDraftChange("subtitle", event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                          placeholder="Historic Asakusa district"
                        />
                      </label>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1">
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Start time
                        </span>
                        <input
                          type="time"
                          value={draft.startTime}
                          onChange={(event) => handleDraftChange("startTime", event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          End time
                        </span>
                        <input
                          type="time"
                          value={draft.endTime}
                          onChange={(event) => handleDraftChange("endTime", event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        />
                      </label>
                    </div>
                    
                    <LocationCombobox
                      label="City"
                      value={draft.cityOption}
                      inputValue={draft.cityText}
                      onInputChange={handleCityInputChange}
                      onChange={handleCitySelect}
                      placeholder="Los Angeles"
                    />
                    <label className="space-y-1">
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Address
                      </span>
                      <input
                        value={draft.address}
                        onChange={(event) => handleDraftChange("address", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        placeholder="1 Chome-1-2 Oshiage, Sumida City"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Notes
                      </span>
                      <textarea
                        rows={3}
                        value={draft.notes}
                        onChange={(event) => handleDraftChange("notes", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        placeholder="Plan to arrive early to beat the crowds."
                      />
                    </label>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeForm}
                        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:border-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingActivity}
                        className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
                      >
                        {isSavingActivity
                          ? "Saving..."
                          : editingActivityId
                          ? "Update activity"
                          : "Save activity"}
                      </button>
                </div>
                  </form>
                )}

                {!day.activities.length && !isActive && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
                  No activities yet. Use the button above to start planning this day.
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
