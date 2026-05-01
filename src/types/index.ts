import type { GitHubIssue, GitHubPullRequest } from "@/lib/github/types";

export type GitHubItem =
  | ({ kind: "issue" } & GitHubIssue)
  | ({ kind: "pull_request" } & GitHubPullRequest);

export type RepoData = {
  repo: string;
  items: GitHubItem[];
  fetchedAt: number;
};
