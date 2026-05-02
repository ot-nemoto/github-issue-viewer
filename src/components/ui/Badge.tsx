import { darkenHex, getLuminance } from "@/lib/colorUtils";

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

export function Badge({ variant = "custom", color, children }: BadgeProps) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";

  if (variant !== "custom" || !color) {
    return (
      <span className={`${base} ${variantClasses[variant]}`}>{children}</span>
    );
  }

  const lum = getLuminance(color);
  // 暗い色はそのまま、明るい色は暗くしてテキスト・ボーダーを読みやすくする
  const textColor = lum < 0.5 ? `#${color}` : darkenHex(color, 0.35);
  const borderColor = lum < 0.5 ? `#${color}` : darkenHex(color, 0.55);
  const style = {
    backgroundColor: `#${color}33`,
    color: textColor,
    borderColor,
  };

  return (
    <span className={`${base} border`} style={style}>
      {children}
    </span>
  );
}
