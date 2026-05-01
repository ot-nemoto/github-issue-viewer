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

function isDark(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  // Perceived luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance < 0.5;
}

export function Badge({ variant = "custom", color, children }: BadgeProps) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";

  if (variant !== "custom" || !color) {
    return (
      <span className={`${base} ${variantClasses[variant]}`}>{children}</span>
    );
  }

  const dark = isDark(color);
  const style = {
    backgroundColor: `#${color}33`,
    color: dark ? `#${color}` : `#${color}cc`,
    borderColor: `#${color}66`,
  };

  return (
    <span className={`${base} border`} style={style}>
      {children}
    </span>
  );
}
