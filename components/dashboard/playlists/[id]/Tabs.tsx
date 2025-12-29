"use client";

type TabId = "info" | "timeline";
interface Props {
  active: "info" | "timeline";
  onChange: (tab: "info" | "timeline") => void;
}

export default function Tabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 border-b border-gray-400 dark:border-gray-700">
      {[
        { id: "timeline", label: "Timeline" },
        { id: "info", label: "Informações" },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id as TabId)}
          className={`px-4 py-2 font-medium transition
            ${
              active === tab.id
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
