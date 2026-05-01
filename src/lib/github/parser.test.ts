import { describe, expect, it } from "vitest";
import { parseRelatedIssues } from "./parser";

describe("parseRelatedIssues", () => {
  it("null は空配列を返す", () => {
    expect(parseRelatedIssues(null)).toEqual([]);
  });

  it("空文字は空配列を返す", () => {
    expect(parseRelatedIssues("")).toEqual([]);
  });

  it("キーワードがない本文は空配列を返す", () => {
    expect(parseRelatedIssues("This PR adds a new feature.")).toEqual([]);
  });

  it("Closes #123 を抽出する", () => {
    expect(parseRelatedIssues("Closes #123")).toEqual([123]);
  });

  it("Fixes #456 を抽出する", () => {
    expect(parseRelatedIssues("Fixes #456")).toEqual([456]);
  });

  it("Resolves #789 を抽出する", () => {
    expect(parseRelatedIssues("Resolves #789")).toEqual([789]);
  });

  it("Close（単数形）を抽出する", () => {
    expect(parseRelatedIssues("Close #1")).toEqual([1]);
  });

  it("大文字小文字を区別しない", () => {
    expect(parseRelatedIssues("closes #10\nFIXES #20")).toEqual([10, 20]);
  });

  it("owner/repo#123 形式を抽出する", () => {
    expect(parseRelatedIssues("Closes owner/repo#42")).toEqual([42]);
  });

  it("複数の関連 Issue を抽出する", () => {
    expect(parseRelatedIssues("Closes #1\nFixes #2\nResolves #3")).toEqual([
      1, 2, 3,
    ]);
  });

  it("重複する Issue 番号は1件にまとめる", () => {
    expect(parseRelatedIssues("Closes #5\nFixes #5")).toEqual([5]);
  });

  it("本文中に埋め込まれたキーワードも抽出する", () => {
    expect(
      parseRelatedIssues("This PR fixes #99 and also closes #100."),
    ).toEqual([99, 100]);
  });

  it("prefixes #1 は抽出しない", () => {
    expect(
      parseRelatedIssues("This change prefixes #1 in generated text."),
    ).toEqual([]);
  });

  it("unfixes #2 は抽出しない", () => {
    expect(
      parseRelatedIssues("This note mentions unfixes #2 as plain text."),
    ).toEqual([]);
  });
});
