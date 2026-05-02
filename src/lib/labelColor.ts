/**
 * ラベル名から固定パレットの色を決定する。
 * リポジトリに依存せず、同じラベル名は常に同じ色になる。
 */
const PALETTE = [
  "0969da", // blue
  "1a7f37", // green
  "cf222e", // red
  "8250df", // purple
  "bf8700", // gold
  "0550ae", // dark blue
  "116329", // dark green
  "953800", // orange
  "1b7c83", // teal
  "6e40c9", // violet
  "a40e26", // dark red
  "4d2d90", // deep purple
];

function hashLabel(name: string): number {
  let hash = 0;
  for (const char of name) {
    hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  }
  return Math.abs(hash);
}

export function getLabelColor(name: string): string {
  return PALETTE[hashLabel(name) % PALETTE.length];
}
