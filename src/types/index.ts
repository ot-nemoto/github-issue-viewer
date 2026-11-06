export type ItemLabel = {
  id: number;
  name: string;
};

type GitHubItemBase = {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: ItemLabel[];
  repo: string;
};

export type GitHubItem =
  | ({ kind: "issue" } & GitHubItemBase)
  | ({
      kind: "pull_request";
      merged_at: string | null;
      relatedIssues: number[];
    } & GitHubItemBase);

export type RepoData = {
  repo: string;
  items: GitHubItem[];
  fetchedAt: number;
};
