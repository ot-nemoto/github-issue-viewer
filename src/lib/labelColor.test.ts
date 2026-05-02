import { describe, expect, it } from "vitest";
import { getLabelColor } from "./labelColor";

const PALETTE = [
  "0969da",
  "1a7f37",
  "cf222e",
  "8250df",
  "bf8700",
  "0550ae",
  "116329",
  "953800",
  "1b7c83",
  "6e40c9",
  "a40e26",
  "4d2d90",
];

describe("getLabelColor", () => {
  it("同じラベル名は常に同じ色を返す（決定論的）", () => {
    const labels = [
      "bug",
      "enhancement",
      "documentation",
      "feature",
      "help wanted",
    ];
    for (const label of labels) {
      expect(getLabelColor(label)).toBe(getLabelColor(label));
    }
  });

  it("返り値はパレット内の色である", () => {
    const labels = [
      "bug",
      "enhancement",
      "documentation",
      "feature",
      "help wanted",
      "good first issue",
      "wontfix",
      "duplicate",
      "invalid",
      "question",
      "dependencies",
      "security",
    ];
    for (const label of labels) {
      expect(PALETTE).toContain(getLabelColor(label));
    }
  });

  it("空文字列でもパレット内の色を返す", () => {
    expect(PALETTE).toContain(getLabelColor(""));
  });

  it("異なるラベル名が複数のパレット色に分散する", () => {
    const labels = Array.from({ length: 100 }, (_, i) => `label-${i}`);
    const colors = new Set(labels.map(getLabelColor));
    // 100件のラベルで少なくとも6色以上使われることを確認
    expect(colors.size).toBeGreaterThanOrEqual(6);
  });

  it("大文字・小文字が異なるラベルは異なる色になりうる", () => {
    // 大文字小文字は区別される（同じ色になることもあるが、異なることを許容）
    const lower = getLabelColor("bug");
    const upper = getLabelColor("Bug");
    // 少なくともどちらもパレット内の色であることを確認
    expect(PALETTE).toContain(lower);
    expect(PALETTE).toContain(upper);
  });
});
