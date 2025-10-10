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
    <div className="flex gap-1 sm:gap-2 border rounded-lg p-1 bg-white w-full sm:w-fit">
      {tabs.map((t) => {
        const active = value === t;
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              active ? "bg-black text-white" : "hover:bg-gray-100"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
