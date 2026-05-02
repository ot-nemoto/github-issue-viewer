/**
 * 16進数カラーコードを RGB に変換する。
 */
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
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

/**
 * 知覚輝度（0〜1）を返す。値が小さいほど暗い色。
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

/**
 * 16進数カラーコードを factor 倍に暗くした色を返す。
 */
export function darkenHex(hex: string, factor: number): string {
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
