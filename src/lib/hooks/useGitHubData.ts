"use client";

import { useCallback, useEffect, useState } from "react";
import { getIssues, getPullRequests } from "@/lib/github/client";
import { getCache, setCache } from "@/lib/storage/cache";
import { getRepos, getToken } from "@/lib/storage/settings";
import type { GitHubItem } from "@/types";

type FailedRepo = { repo: string; message: string };

type State =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      data: GitHubItem[];
      fetchedAt: number;
      hasRepos: boolean;
      failedRepos: FailedRepo[];
    }
  | { status: "error"; message: string };

function parseRepoIdentifier(repo: string): { owner: string; name: string } {
  const parts = repo.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      `リポジトリ設定 "${repo}" は不正です。"owner/repo" 形式で指定してください。`,
    );
  }
  const [owner, name] = parts;
  return { owner, name };
}

async function fetchRepoItems(
  repo: string,
  token: string | null,
): Promise<GitHubItem[]> {
  const { owner, name } = parseRepoIdentifier(repo);
  const t = token ?? undefined;
  const [issues, prs] = await Promise.all([
    getIssues(owner, name, t),
    getPullRequests(owner, name, t),
  ]);

  const issueItems: GitHubItem[] = issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({ kind: "issue" as const, repo, ...issue }));

  const prItems: GitHubItem[] = prs.map((pr) => ({
    kind: "pull_request" as const,
    repo,
    ...pr,
  }));

  return [...issueItems, ...prItems];
}

export function useGitHubData() {
  const [state, setState] = useState<State>({ status: "idle" });

  const load = useCallback(async (forceRefresh = false) => {
    const repos = getRepos();
    const token = getToken();

    if (repos.length === 0) {
      setState({
        status: "success",
        data: [],
        fetchedAt: Date.now(),
        hasRepos: false,
        failedRepos: [],
      });
      return;
    }

    setState({ status: "loading" });

    const allItems: GitHubItem[] = [];
    const failedRepos: FailedRepo[] = [];

    await Promise.all(
      repos.map(async (repo) => {
        const cacheKey = repo;

        if (!forceRefresh) {
          const cached = getCache<GitHubItem[]>(cacheKey);
          if (cached) {
            allItems.push(...cached);
            return;
          }
        }

        try {
          const items = await fetchRepoItems(repo, token);
          setCache(cacheKey, items);
          allItems.push(...items);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "データの取得に失敗しました";
          failedRepos.push({ repo, message });
        }
      }),
    );

    // 全リポジトリが失敗した場合のみ error 状態
    if (failedRepos.length === repos.length) {
      setState({ status: "error", message: failedRepos[0].message });
      return;
    }

    const sorted = allItems.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );

    setState({
      status: "success",
      data: sorted,
      fetchedAt: Date.now(),
      hasRepos: true,
      failedRepos,
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { state, refresh };
}
