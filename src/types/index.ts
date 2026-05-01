import type { GitHubIssue, GitHubPullRequest } from "@/lib/github/types";

export type GitHubItem =
  | ({ kind: "issue"; repo: string } & GitHubIssue)
  | ({ kind: "pull_request"; repo: string } & GitHubPullRequest);

export type RepoData = {
  repo: string;
  items: GitHubItem[];
  fetchedAt: number;
};
