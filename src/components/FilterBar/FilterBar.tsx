"use client";

export type LabelOption = { name: string; color: string };

export type FilterState = {
  types: ("issue" | "pull_request")[];
  statuses: ("open" | "closed")[];
  labels: string[];
};

type FilterBarProps = {
  filter: FilterState;
  availableLabels: LabelOption[];
  onChange: (filter: FilterState) => void;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace(/^#/, "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

function darkenHex(hex: string, factor: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `#${hex}`;
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((v) =>
      Math.round(v * factor)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function getLabelStyle(color: string, active: boolean) {
  if (!active) {
    return {
      backgroundColor: "white",
      color: "#636c76",
      borderColor: "#d0d7de",
    };
  }
  const lum = getLuminance(color);
  const textColor = lum < 0.5 ? `#${color}` : darkenHex(color, 0.35);
  const borderColor = lum < 0.5 ? `#${color}` : darkenHex(color, 0.55);
  return {
    backgroundColor: `#${color}33`,
    color: textColor,
    borderColor,
  };
}

export function FilterBar({
  filter,
  availableLabels,
  onChange,
}: FilterBarProps) {
  const typeOptions: { value: "issue" | "pull_request"; label: string }[] = [
    { value: "issue", label: "Issue" },
    { value: "pull_request", label: "PR" },
  ];

  const statusOptions: { value: "open" | "closed"; label: string }[] = [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
  ];

  const toggleType = (value: "issue" | "pull_request") => {
    const next = filter.types.includes(value)
      ? filter.types.filter((t) => t !== value)
      : [...filter.types, value];
    onChange({ ...filter, types: next });
  };

  const toggleStatus = (value: "open" | "closed") => {
    const next = filter.statuses.includes(value)
      ? filter.statuses.filter((s) => s !== value)
      : [...filter.statuses, value];
    onChange({ ...filter, statuses: next });
  };

  const toggleLabel = (name: string) => {
    const next = filter.labels.includes(name)
      ? filter.labels.filter((l) => l !== name)
      : [...filter.labels, name];
    onChange({ ...filter, labels: next });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center py-2.5 px-4 bg-white border border-[#d0d7de] rounded-md">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#636c76] font-medium">タイプ</span>
        <div className="flex rounded-md overflow-hidden border border-[#d0d7de]">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={filter.types.includes(opt.value)}
              onClick={() => toggleType(opt.value)}
              className={`px-3 py-1 text-xs transition-colors ${
                filter.types.includes(opt.value)
                  ? "bg-[#0969da] text-white"
                  : "bg-white text-[#1f2328] hover:bg-[#f6f8fa]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-[#636c76] font-medium">ステータス</span>
        <div className="flex rounded-md overflow-hidden border border-[#d0d7de]">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              aria-pressed={filter.statuses.includes(opt.value)}
              onClick={() => toggleStatus(opt.value)}
              className={`px-3 py-1 text-xs transition-colors ${
                filter.statuses.includes(opt.value)
                  ? "bg-[#0969da] text-white"
                  : "bg-white text-[#1f2328] hover:bg-[#f6f8fa]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {availableLabels.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#636c76] font-medium">ラベル</span>
          {availableLabels.map(({ name, color }) => {
            // 空配列 = 全選択とみなす
            const active =
              filter.labels.length === 0 || filter.labels.includes(name);
            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                onClick={() => toggleLabel(name)}
                style={getLabelStyle(color, active)}
                className="px-2 py-0.5 text-xs rounded-full border font-medium transition-colors hover:opacity-80"
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
