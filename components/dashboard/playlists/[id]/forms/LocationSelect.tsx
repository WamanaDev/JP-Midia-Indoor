"use client";

import AsyncSelect from "react-select/async";
import type { SingleValue } from "react-select";
import { LocationValue } from "@/interfaces/Preview";

type Option = {
  label: string;
  value: LocationValue;
};

interface Props {
  value?: LocationValue;
  onChange: (value: LocationValue | undefined) => void;
}

export function LocationSelect({ value, onChange }: Props) {
  const loadOptions = async (input: string): Promise<Option[]> => {
    if (input.length < 3) return [];

    const res = await fetch(
      `/api/player/geocoding?q=${encodeURIComponent(input)}`
    );
    const json = await res.json();

    return json.results.map((r: any) => ({
      label: `${r.name}, ${r.country}`,
      value: {
        name: r.name,
        country: r.country,
        lat: r.lat,
        lon: r.lon,
      },
    }));
  };

  return (
    <>
      <AsyncSelect<Option, false>
        unstyled
        cacheOptions
        loadOptions={loadOptions}
        value={
          value
            ? {
                label: `${value.name}, ${value.country}`,
                value,
              }
            : undefined
        }
        onChange={(opt: SingleValue<Option>) => onChange(opt?.value)}
        placeholder="Digite uma cidade"
        noOptionsMessage={() => "Digite ao menos 3 letras"}
        classNames={{
          control: ({ isFocused }) =>
            `
          flex items-center min-h-[44px] border px-2
          bg-gray-100 text-gray-800
          dark:bg-gray-800 dark:text-gray-200
          ${
            isFocused
              ? "border-blue-500 ring-1 ring-blue-500 rounded-t-lg"
              : "border-gray-300 dark:border-gray-700 rounded-lg"
          }
        `,
          menu: () =>
            `
          rounded-b-lg border shadow-lg overflow-hidden
          bg-white dark:bg-gray-900
          border-gray-200 dark:border-gray-700 outline-1 outline-sky-500 text-sm p-2
        `,
          option: ({ isFocused, isSelected }) =>
            `
          px-3 py-2 cursor-pointer text-sm
          ${
            isSelected
              ? "bg-blue-600 text-white"
              : isFocused
              ? "bg-gray-100 dark:bg-gray-800"
              : "text-gray-800 dark:text-gray-200"
          }
        `,
          input: () => "text-gray-800 dark:text-gray-200",
          singleValue: () => "text-gray-800 dark:text-gray-200",
          placeholder: () => "text-gray-400 dark:text-gray-500",
          menuList: () => "max-h-60 overflow-y-auto",
        }}
      />
    </>
  );
}
