"use client";

import { format } from "date-fns";
import { TripWithRelations } from "@/lib/trips";
import { FiHome, FiNavigation, FiUser, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { useState } from "react";
import clsx from "clsx";

interface TripLogisticsPanelProps {
  tripId: string;
  lodgings: TripWithRelations["lodgings"];
  segments: TripWithRelations["segments"];
  companions: TripWithRelations["companions"];
}

const emptyLodging = {
  name: "",
  address: "",
  checkIn: "",
  checkOut: "",
  confirmationNumber: "",
  notes: "",
  url: ""
};

const segmentTypeOptions = [
  { value: "FLIGHT", label: "Flight" },
  { value: "TRAIN", label: "Train" },
  { value: "BUS", label: "Bus" },
  { value: "CAR", label: "Car" },
  { value: "BOAT", label: "Boat" },
  { value: "WALK", label: "Walk" },
  { value: "OTHER", label: "Other" }
];

const emptySegment = {
  type: segmentTypeOptions[0].value,
  carrier: "",
  confirmationNumber: "",
  departureCity: "",
  arrivalCity: "",
  departureTime: "",
  arrivalTime: "",
  seat: ""
};

const emptyCompanion = {
  name: "",
  email: "",
  status: "confirmed"
};

export function TripLogisticsPanel({ tripId, lodgings, segments, companions }: TripLogisticsPanelProps) {
  const [lodgingList, setLodgingList] = useState(lodgings);
  const [segmentList, setSegmentList] = useState(segments);
  const [companionList, setCompanionList] = useState(companions);

  const [showLodgingForm, setShowLodgingForm] = useState(false);
  const [lodgingForm, setLodgingForm] = useState(emptyLodging);
  const [lodgingLoading, setLodgingLoading] = useState(false);

  const [showSegmentForm, setShowSegmentForm] = useState(false);
  const [segmentForm, setSegmentForm] = useState(emptySegment);
  const [segmentLoading, setSegmentLoading] = useState(false);

  const [showCompanionForm, setShowCompanionForm] = useState(false);
  const [companionForm, setCompanionForm] = useState(emptyCompanion);
  const [companionLoading, setCompanionLoading] = useState(false);

  const resetLodgingForm = () => {
    setLodgingForm(emptyLodging);
    setShowLodgingForm(false);
    setLodgingLoading(false);
  };

  const resetSegmentForm = () => {
    setSegmentForm(emptySegment);
    setShowSegmentForm(false);
    setSegmentLoading(false);
  };

  const resetCompanionForm = () => {
    setCompanionForm(emptyCompanion);
    setShowCompanionForm(false);
    setCompanionLoading(false);
  };

  const handleCreateLodging = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLodgingLoading(true);
    try {
      const payload = {
        tripId,
        name: lodgingForm.name.trim(),
        address: lodgingForm.address.trim() || undefined,
        checkIn: new Date(lodgingForm.checkIn).toISOString(),
        checkOut: new Date(lodgingForm.checkOut).toISOString(),
        confirmationNumber: lodgingForm.confirmationNumber.trim() || undefined,
        notes: lodgingForm.notes.trim() || undefined,
        url: lodgingForm.url.trim() || undefined
      };

      const response = await fetch("/api/lodgings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to create lodging");

      const newLodging = await response.json();
      setLodgingList((prev) => [...prev, newLodging].sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()));
      resetLodgingForm();
    } catch (error) {
      console.error(error);
      alert("Unable to add lodging. Please try again.");
      setLodgingLoading(false);
    }
  };

  const handleDeleteLodging = async (id: string) => {
    if (!window.confirm("Delete this lodging?")) return;
    try {
      const response = await fetch(`/api/lodgings/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete lodging");
      setLodgingList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      alert("Unable to delete lodging. Please try again.");
    }
  };

  const handleCreateSegment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSegmentLoading(true);
    try {
      const payload = {
        tripId,
        type: segmentForm.type,
        carrier: segmentForm.carrier.trim() || undefined,
        confirmationNumber: segmentForm.confirmationNumber.trim() || undefined,
        departureCity: segmentForm.departureCity.trim(),
        arrivalCity: segmentForm.arrivalCity.trim(),
        departureTime: new Date(segmentForm.departureTime).toISOString(),
        arrivalTime: new Date(segmentForm.arrivalTime).toISOString(),
        seat: segmentForm.seat.trim() || undefined
      };

      const response = await fetch("/api/transport-segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to create transport segment");

      const newSegment = await response.json();
      setSegmentList((prev) => [...prev, newSegment].sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()));
      resetSegmentForm();
    } catch (error) {
      console.error(error);
      alert("Unable to add transport segment. Please try again.");
      setSegmentLoading(false);
    }
  };

  const handleDeleteSegment = async (id: string) => {
    if (!window.confirm("Delete this transport segment?")) return;
    try {
      const response = await fetch(`/api/transport-segments/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete segment");
      setSegmentList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      alert("Unable to delete segment. Please try again.");
    }
  };

  const handleCreateCompanion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCompanionLoading(true);
    try {
      const payload = {
        tripId,
        name: companionForm.name.trim(),
        email: companionForm.email.trim() || undefined,
        status: companionForm.status.trim() || undefined
      };

      const response = await fetch("/api/companions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to add companion");

      const newCompanion = await response.json();
      setCompanionList((prev) => [...prev, newCompanion].sort((a, b) => a.name.localeCompare(b.name)));
      resetCompanionForm();
    } catch (error) {
      console.error(error);
      alert("Unable to add companion. Please try again.");
      setCompanionLoading(false);
    }
  };

  const handleDeleteCompanion = async (id: string) => {
    if (!window.confirm("Remove this companion?")) return;
    try {
      const response = await fetch(`/api/companions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete companion");
      setCompanionList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      alert("Unable to delete companion. Please try again.");
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Logistics</p>
          <h2 className="text-lg font-semibold text-slate-900">Stays & transport</h2>
        </div>
      </header>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <FiHome className="h-4 w-4 text-brand-500" /> Lodging
            </h3>
            <button
              type="button"
              onClick={() => setShowLodgingForm((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:border-brand-200 hover:text-brand-600"
            >
              {showLodgingForm ? (
                <>
                  <FiX className="h-3 w-3" /> Cancel
                </>
              ) : (
                <>
                  <FiPlus className="h-3 w-3" /> Add lodging
                </>
              )}
            </button>
          </div>
          {showLodgingForm && (
            <form onSubmit={handleCreateLodging} className="mt-3 space-y-3 rounded-2xl border border-brand-200 bg-white p-4 text-xs shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Name</span>
                  <input
                    required
                    value={lodgingForm.name}
                    onChange={(event) => setLodgingForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="Hotel name"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Confirmation</span>
                  <input
                    value={lodgingForm.confirmationNumber}
                    onChange={(event) => setLodgingForm((prev) => ({ ...prev, confirmationNumber: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="ABC123"
                  />
                </label>
              </div>
              <label className="space-y-1">
                <span className="font-semibold uppercase tracking-wide text-slate-500">Address</span>
                <input
                  value={lodgingForm.address}
                  onChange={(event) => setLodgingForm((prev) => ({ ...prev, address: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  placeholder="123 Main St"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Check-in</span>
                  <input
                    required
                    type="datetime-local"
                    value={lodgingForm.checkIn}
                    onChange={(event) => setLodgingForm((prev) => ({ ...prev, checkIn: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Check-out</span>
                  <input
                    required
                    type="datetime-local"
                    value={lodgingForm.checkOut}
                    onChange={(event) => setLodgingForm((prev) => ({ ...prev, checkOut: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </label>
              </div>
              <label className="space-y-1">
                <span className="font-semibold uppercase tracking-wide text-slate-500">Notes</span>
                <textarea
                  rows={2}
                  value={lodgingForm.notes}
                  onChange={(event) => setLodgingForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  placeholder="Early check-in requested"
                />
              </label>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetLodgingForm}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={lodgingLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
                >
                  {lodgingLoading ? "Saving..." : "Save lodging"}
                </button>
              </div>
            </form>
          )}
          <div className="mt-3 space-y-3">
            {lodgingList.map((stay) => (
              <div key={stay.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{stay.name}</p>
                    {stay.address && <p className="mt-1">{stay.address}</p>}
                    <p className="mt-2 font-medium text-slate-500">
                      {format(new Date(stay.checkIn), "MMM d")} – {format(new Date(stay.checkOut), "MMM d")}
                    </p>
                    {stay.confirmationNumber && (
                      <p className="mt-1 text-emerald-600">
                        Conf #: <span className="font-semibold">{stay.confirmationNumber}</span>
                      </p>
                    )}
                    {stay.notes && <p className="mt-1">{stay.notes}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteLodging(stay.id)}
                    className="rounded-full border border-rose-200 px-3 py-1.5 text-[11px] font-semibold text-rose-500 hover:border-rose-300 hover:text-rose-600"
                  >
                    <FiTrash2 className="mr-1 inline h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
            {!lodgingList.length && !showLodgingForm && (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                Add lodging details to keep all confirmation info handy.
              </p>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <FiNavigation className="h-4 w-4 text-brand-500" /> Transport
            </h3>
            <button
              type="button"
              onClick={() => setShowSegmentForm((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:border-brand-200 hover:text-brand-600"
            >
              {showSegmentForm ? (
                <>
                  <FiX className="h-3 w-3" /> Cancel
                </>
              ) : (
                <>
                  <FiPlus className="h-3 w-3" /> Add transport
                </>
              )}
            </button>
          </div>
          {showSegmentForm && (
            <form onSubmit={handleCreateSegment} className="mt-3 space-y-3 rounded-2xl border border-brand-200 bg-white p-4 text-xs shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Type</span>
                  <select
                    value={segmentForm.type}
                    onChange={(event) => setSegmentForm((prev) => ({ ...prev, type: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  >
                    {segmentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Carrier</span>
                  <input
                    value={segmentForm.carrier}
                    onChange={(event) => setSegmentForm((prev) => ({ ...prev, carrier: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="Airline or operator"
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Departing from</span>
                  <input
                    required
                    value={segmentForm.departureCity}
                    onChange={(event) => setSegmentForm((prev) => ({ ...prev, departureCity: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="Los Angeles"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Arriving in</span>
                  <input
                    required
                    value={segmentForm.arrivalCity}
                    onChange={(event) => setSegmentForm((prev) => ({ ...prev, arrivalCity: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="Tokyo"
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Departure</span>
                  <input
                    required
                    type="datetime-local"
                    value={segmentForm.departureTime}
                    onChange={(event) => setSegmentForm((prev) => ({ ...prev, departureTime: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Arrival</span>
                  <input
                    required
                    type="datetime-local"
                    value={segmentForm.arrivalTime}
                    onChange={(event) => setSegmentForm((prev) => ({ ...prev, arrivalTime: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Confirmation</span>
                  <input
                    value={segmentForm.confirmationNumber}
                    onChange={(event) => setSegmentForm((prev) => ({ ...prev, confirmationNumber: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="ABC123"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Seat</span>
                  <input
                    value={segmentForm.seat}
                    onChange={(event) => setSegmentForm((prev) => ({ ...prev, seat: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="12A"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetSegmentForm}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={segmentLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
                >
                  {segmentLoading ? "Saving..." : "Save transport"}
                </button>
              </div>
            </form>
          )}
          <div className="mt-3 space-y-3">
            {segmentList.map((segment) => (
              <div key={segment.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{segment.type.replace("_", " ")}</p>
                    <p className="mt-1 font-medium text-slate-500">
                      {segment.departureCity} → {segment.arrivalCity}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {format(new Date(segment.departureTime), "MMM d, HH:mm")} – {format(new Date(segment.arrivalTime), "MMM d, HH:mm")}
                    </p>
                    {segment.carrier && <p className="mt-1">Carrier: {segment.carrier}</p>}
                    {segment.confirmationNumber && <p className="mt-1">Confirmation: {segment.confirmationNumber}</p>}
                    {segment.seat && <p className="mt-1">Seat: {segment.seat}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSegment(segment.id)}
                    className="rounded-full border border-rose-200 px-3 py-1.5 text-[11px] font-semibold text-rose-500 hover:border-rose-300 hover:text-rose-600"
                  >
                    <FiTrash2 className="mr-1 inline h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
            {!segmentList.length && !showSegmentForm && (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                Track flights, trains, and other segments to build a complete journey timeline.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FiUser className="h-4 w-4 text-brand-500" /> Companions
          </h3>
          <button
            type="button"
            onClick={() => setShowCompanionForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:border-brand-200 hover:text-brand-600"
          >
            {showCompanionForm ? (
              <>
                <FiX className="h-3 w-3" /> Cancel
              </>
            ) : (
              <>
                <FiPlus className="h-3 w-3" /> Add companion
              </>
            )}
          </button>
        </div>
        {showCompanionForm && (
          <form onSubmit={handleCreateCompanion} className="mt-3 space-y-3 rounded-2xl border border-brand-200 bg-white p-4 text-xs shadow-sm">
            <label className="space-y-1">
              <span className="font-semibold uppercase tracking-wide text-slate-500">Name</span>
              <input
                required
                value={companionForm.name}
                onChange={(event) => setCompanionForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="Travel buddy"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="font-semibold uppercase tracking-wide text-slate-500">Email</span>
                <input
                  value={companionForm.email}
                  onChange={(event) => setCompanionForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  placeholder="friend@example.com"
                />
              </label>
              <label className="space-y-1">
                <span className="font-semibold uppercase tracking-wide text-slate-500">Status</span>
                <select
                  value={companionForm.status}
                  onChange={(event) => setCompanionForm((prev) => ({ ...prev, status: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="invited">Invited</option>
                  <option value="pending">Pending</option>
                  <option value="declined">Declined</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetCompanionForm}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 hover:border-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={companionLoading}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
              >
                {companionLoading ? "Saving..." : "Save companion"}
              </button>
            </div>
          </form>
        )}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
          {companionList.map((companion) => (
            <span
              key={companion.id}
              className={clsx(
                "inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold",
                companion.status !== "confirmed" && "bg-amber-50"
              )}
            >
              <span>{companion.name}</span>
              {companion.status && companion.status !== "confirmed" && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-700">
                  {companion.status}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDeleteCompanion(companion.id)}
                className="rounded-full border border-rose-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-rose-500 hover:border-rose-300 hover:text-rose-600"
              >
                Remove
              </button>
            </span>
          ))}
          {!companionList.length && !showCompanionForm && (
            <span className="rounded-full bg-slate-100 px-3 py-1">Invite friends to collaborate.</span>
          )}
        </div>
      </div>
    </section>
  );
}
