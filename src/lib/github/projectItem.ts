import type { GitHubItem, ItemLabel } from "@/types";
import { parseRelatedIssues } from "./parser";
import type { GitHubIssue, GitHubLabel, GitHubPullRequest } from "./types";

function projectLabels(labels: GitHubLabel[]): ItemLabel[] {
  return labels.map((label) => ({ id: label.id, name: label.name }));
}

export function projectIssue(issue: GitHubIssue, repo: string): GitHubItem {
  return {
    kind: "issue",
    repo,
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    html_url: issue.html_url,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    labels: projectLabels(issue.labels),
  };
}

export function projectPullRequest(
  pr: GitHubPullRequest,
  repo: string,
): GitHubItem {
  return {
    kind: "pull_request",
    repo,
    id: pr.id,
    number: pr.number,
    title: pr.title,
    state: pr.state,
    html_url: pr.html_url,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    labels: projectLabels(pr.labels),
    merged_at: pr.merged_at,
    relatedIssues: parseRelatedIssues(pr.body),
  };
}
