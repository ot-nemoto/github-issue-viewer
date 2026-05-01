import type {
  GitHubIssue,
  GitHubPullRequest,
  GitHubRepository,
  GitHubUser,
} from "./types";

const BASE_URL = "https://api.github.com";

export class GitHubApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

function buildHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubFetch(url: string, token: string): Promise<Response> {
  const response = await fetch(url, { headers: buildHeaders(token) });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = (await response.json()) as { message?: string };
      if (typeof data.message === "string") message = data.message;
    } catch {
      // use statusText as fallback
    }
    throw new GitHubApiError(response.status, message);
  }

  return response;
}

function parseNextUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : null;
}

async function fetchAllPages<T>(url: string, token: string): Promise<T[]> {
  const results: T[] = [];
  const initialUrl = new URL(url);
  initialUrl.searchParams.set("per_page", "100");
  let nextUrl: string | null = initialUrl.toString();

  while (nextUrl) {
    const response = await githubFetch(nextUrl, token);
    const data = (await response.json()) as T[];
    results.push(...data);
    nextUrl = parseNextUrl(response.headers.get("Link"));
  }

  return results;
}

export async function validateToken(token: string): Promise<GitHubUser> {
  const response = await githubFetch(`${BASE_URL}/user`, token);
  return response.json() as Promise<GitHubUser>;
}

export async function getRepository(
  owner: string,
  repo: string,
  token: string,
): Promise<GitHubRepository> {
  const response = await githubFetch(
    `${BASE_URL}/repos/${owner}/${repo}`,
    token,
  );
  return response.json() as Promise<GitHubRepository>;
}

export async function getIssues(
  owner: string,
  repo: string,
  token: string,
): Promise<GitHubIssue[]> {
  return fetchAllPages<GitHubIssue>(
    `${BASE_URL}/repos/${owner}/${repo}/issues?state=all`,
    token,
  );
}

export async function getPullRequests(
  owner: string,
  repo: string,
  token: string,
): Promise<GitHubPullRequest[]> {
  return fetchAllPages<GitHubPullRequest>(
    `${BASE_URL}/repos/${owner}/${repo}/pulls?state=all`,
    token,
  );
}
