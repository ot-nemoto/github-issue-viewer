type BadgeVariant = "open" | "closed" | "merged" | "draft" | "custom";

type BadgeProps = {
  variant?: BadgeVariant;
  color?: string;
  children: React.ReactNode;
};

const variantClasses: Record<BadgeVariant, string> = {
  open: "bg-green-100 text-green-800 border border-green-300",
  closed: "bg-red-100 text-red-800 border border-red-300",
  merged: "bg-purple-100 text-purple-800 border border-purple-300",
  draft: "bg-gray-100 text-gray-600 border border-gray-300",
  custom: "",
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

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

// 明るい色を暗くしてテキストに使う
function darkenHex(hex: string, factor: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `#${hex}`;
  const r = Math.round(rgb.r * factor)
    .toString(16)
    .padStart(2, "0");
  const g = Math.round(rgb.g * factor)
    .toString(16)
    .padStart(2, "0");
  const b = Math.round(rgb.b * factor)
    .toString(16)
    .padStart(2, "0");
  return `#${r}${g}${b}`;
}

export function Badge({ variant = "custom", color, children }: BadgeProps) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";

  if (variant !== "custom" || !color) {
    return (
      <span className={`${base} ${variantClasses[variant]}`}>{children}</span>
    );
  }

  const lum = luminance(color);
  // 暗い色はそのまま、明るい色は 35% まで暗くしてテキストを読みやすくする
  const textColor = lum < 0.5 ? `#${color}` : darkenHex(color, 0.35);
  const style = {
    backgroundColor: `#${color}33`,
    color: textColor,
    borderColor: `#${color}66`,
  };

  return (
    <span className={`${base} border`} style={style}>
      {children}
    </span>
  );
}
