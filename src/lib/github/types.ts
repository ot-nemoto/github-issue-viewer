export type GitHubUser = {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
};

export type GitHubLabel = {
  id: number;
  name: string;
  color: string;
  description: string | null;
};

export type GitHubMilestone = {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
};

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
};

export type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  body: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  labels: GitHubLabel[];
  assignees: GitHubUser[];
  milestone: GitHubMilestone | null;
  user: GitHubUser;
  pull_request?: {
    url: string;
    html_url: string;
    merged_at: string | null;
  };
};

export type GitHubPullRequest = {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  draft: boolean;
  body: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  labels: GitHubLabel[];
  assignees: GitHubUser[];
  milestone: GitHubMilestone | null;
  user: GitHubUser;
};
