import { describe, expect, it } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("ISO 8601 文字列から日付部分(YYYY-MM-DD)を抽出する", () => {
    expect(formatDate("2024-01-02T00:00:00Z")).toBe("2024-01-02");
  });

  it("タイムゾーンオフセット付きの文字列でも日付部分を抽出する", () => {
    expect(formatDate("2024-01-02T00:00:00+09:00")).toBe("2024-01-02");
  });
});
