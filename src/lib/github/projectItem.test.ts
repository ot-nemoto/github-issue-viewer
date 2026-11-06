import { describe, expect, it } from "vitest";
import { projectIssue, projectPullRequest } from "./projectItem";
import type { GitHubIssue, GitHubPullRequest, GitHubUser } from "./types";

const user: GitHubUser = {
  login: "octocat",
  id: 1,
  avatar_url: "https://example.com/a.png",
  html_url: "https://github.com/octocat",
};

const baseIssue: GitHubIssue = {
  id: 100,
  number: 1,
  title: "Issue title",
  state: "open",
  body: "本文はキャッシュに残さない",
  html_url: "https://github.com/owner/repo/issues/1",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z",
  closed_at: null,
  labels: [
    { id: 10, name: "bug", color: "ff0000", description: "バグ" },
    { id: 11, name: "docs", color: "00ff00", description: null },
  ],
  assignees: [user],
  milestone: null,
  user,
};

const basePr: GitHubPullRequest = {
  id: 200,
  number: 2,
  title: "PR title",
  state: "closed",
  draft: false,
  body: "Closes #1\nFixes #2",
  html_url: "https://github.com/owner/repo/pull/2",
  created_at: "2024-01-03T00:00:00Z",
  updated_at: "2024-01-04T00:00:00Z",
  closed_at: "2024-01-05T00:00:00Z",
  merged_at: "2024-01-05T00:00:00Z",
  labels: [{ id: 20, name: "enhancement", color: "0000ff", description: null }],
  assignees: [user],
  milestone: null,
  user,
};

describe("projectIssue", () => {
  it("使用するフィールドのみを持つ issue に変換する", () => {
    const result = projectIssue(baseIssue, "owner/repo");
    expect(result).toEqual({
      kind: "issue",
      repo: "owner/repo",
      id: 100,
      number: 1,
      title: "Issue title",
      state: "open",
      html_url: "https://github.com/owner/repo/issues/1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
      labels: [
        { id: 10, name: "bug" },
        { id: 11, name: "docs" },
      ],
    });
  });

  it("不要なフィールド（body・user・assignees・color 等）を保持しない", () => {
    const result = projectIssue(baseIssue, "owner/repo");
    expect(result).not.toHaveProperty("body");
    expect(result).not.toHaveProperty("user");
    expect(result).not.toHaveProperty("assignees");
    expect(result).not.toHaveProperty("milestone");
    expect(result).not.toHaveProperty("closed_at");
    expect(result.labels[0]).not.toHaveProperty("color");
    expect(result.labels[0]).not.toHaveProperty("description");
  });
});

describe("projectPullRequest", () => {
  it("body から relatedIssues を算出し body 自体は保持しない", () => {
    const result = projectPullRequest(basePr, "owner/repo");
    expect(result.kind).toBe("pull_request");
    if (result.kind !== "pull_request") throw new Error("unreachable");
    expect(result.relatedIssues).toEqual([1, 2]);
    expect(result.merged_at).toBe("2024-01-05T00:00:00Z");
    expect(result).not.toHaveProperty("body");
    expect(result).not.toHaveProperty("draft");
  });

  it("body が null の場合 relatedIssues は空配列", () => {
    const result = projectPullRequest({ ...basePr, body: null }, "owner/repo");
    if (result.kind !== "pull_request") throw new Error("unreachable");
    expect(result.relatedIssues).toEqual([]);
  });

  it("labels は id・name のみに絞られる", () => {
    const result = projectPullRequest(basePr, "owner/repo");
    expect(result.labels).toEqual([{ id: 20, name: "enhancement" }]);
  });
});
