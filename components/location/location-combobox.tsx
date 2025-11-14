"use client";

import { useCallback, useMemo, useState } from "react";
import { Combobox } from "@headlessui/react";
import { FiMapPin, FiLoader } from "react-icons/fi";
import { nanoid } from "nanoid";

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface LocationOption {
  placeId: string;
  description: string;
  lat?: number;
  lng?: number;
}

interface LocationComboboxProps {
  value: LocationOption | null;
  inputValue: string;
  onChange: (value: LocationOption | null) => void;
  onInputChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export function LocationCombobox({
  value,
  inputValue,
  onChange,
  onInputChange,
  label,
  placeholder
}: LocationComboboxProps) {
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const sessionToken = useMemo(() => nanoid(), []);

  const fetchPredictions = useCallback(
    async (input: string) => {
      if (!input || input.trim().length < 3) {
        setOptions([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          query: input,
          sessionToken
        });
        const response = await fetch(`/api/places/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch places predictions");
        }
        const data = await response.json();
        if (Array.isArray(data.predictions)) {
          setOptions(
            data.predictions.map((prediction: Prediction) => ({
              placeId: prediction.place_id,
              description: prediction.description
            }))
          );
        } else {
          setOptions([]);
        }
      } catch (error) {
        console.error("[LocationCombobox] fetch error", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [sessionToken]
  );

  const handleQueryChange = (newQuery: string) => {
    onInputChange(newQuery);
    fetchPredictions(newQuery);
  };

  const fetchDetails = useCallback(
    async (placeId: string) => {
      try {
        const params = new URLSearchParams({
          placeId,
          sessionToken
        });
        const response = await fetch(`/api/places/details?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch place details");
        }
        return response.json();
      } catch (error) {
        console.error("[LocationCombobox] details error", error);
        return null;
      }
    },
    [sessionToken]
  );

  const handleSelect = async (option: LocationOption | null) => {
    if (!option) {
      onChange(null);
      return;
    }
    onInputChange(option.description);
    const details = await fetchDetails(option.placeId);
    if (details?.result?.geometry?.location) {
      const { lat, lng } = details.result.geometry.location;
      onChange({
        ...option,
        lat,
        lng
      });
    } else {
      onChange(option);
    }
  };

  return (
    <div className="space-y-1">
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <Combobox value={value} onChange={handleSelect}>
        <div className="relative">
          <Combobox.Input
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
            displayValue={() => value?.description ?? inputValue}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder={placeholder}
          />
          <FiMapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          {loading && (
            <div className="absolute inset-y-0 right-10 flex items-center text-slate-400">
              <FiLoader className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>

        {options.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-2 text-sm shadow-xl">
            {options.map((option) => (
              <Combobox.Option
                key={option.placeId}
                value={option}
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 ${active ? "bg-brand-50 text-brand-700" : "text-slate-700"}`
                }
              >
                <div className="font-semibold">{option.description}</div>
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </Combobox>
    </div>
  );
}

