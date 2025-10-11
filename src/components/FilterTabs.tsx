export type FilterKey = "All" | "Rings" | "GemStones";

export default function FilterTabs({
  value,
  onChange,
}: {
  value: FilterKey;
  onChange: (v: FilterKey) => void;
}) {
  const tabs: FilterKey[] = ["All", "Rings", "GemStones"];
  return (
    <div className="flex gap-1 sm:gap-2 border border-gray-200 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800 w-full sm:w-fit transition-colors">
      {tabs.map((t) => {
        const active = value === t;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              active ? "bg-black dark:bg-white text-white dark:text-black" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
