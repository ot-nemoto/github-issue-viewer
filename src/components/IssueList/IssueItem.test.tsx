// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GitHubItem } from "@/types";
import { IssueItem } from "./IssueItem";

// 旧フォーマットのキャッシュ（relatedIssues フィールドを持たない PR）を模す
const legacyPrItem = {
  kind: "pull_request",
  repo: "owner/repo",
  id: 200,
  number: 2,
  title: "Legacy PR",
  state: "closed",
  html_url: "https://github.com/owner/repo/pull/2",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
  merged_at: "2024-01-03T00:00:00Z",
  labels: [],
  // relatedIssues を意図的に欠落させる
} as unknown as GitHubItem;

describe("IssueItem — 旧フォーマットキャッシュ互換", () => {
  it("relatedIssues が欠落した PR でもクラッシュせず描画できる", () => {
    expect(() => render(<IssueItem item={legacyPrItem} />)).not.toThrow();
    expect(screen.getByText("Legacy PR")).toBeDefined();
  });

  it("relatedIssues が欠落している場合は関連 Issue 行を表示しない", () => {
    render(<IssueItem item={legacyPrItem} />);
    expect(screen.queryByText(/関連:/)).toBeNull();
  });
});
