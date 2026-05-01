"use client";

import { FilterBar, type FilterState } from "@/components/FilterBar/FilterBar";
import { IssueList } from "@/components/IssueList/IssueList";
import { Spinner } from "@/components/ui/Spinner";
import { useGitHubData } from "@/lib/hooks/useGitHubData";
import { getRepos } from "@/lib/storage/settings";
import type { GitHubItem } from "@/types";
import Link from "next/link";
import { useMemo, useState } from "react";

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

const DEFAULT_FILTER: FilterState = {
  type: "all",
  status: "all",
  repos: [],
  labels: [],
};

function applyFilter(items: GitHubItem[], filter: FilterState): GitHubItem[] {
  return items.filter((item) => {
    if (filter.type !== "all" && item.kind !== filter.type) return false;

    if (filter.status !== "all") {
      const isMerged = item.kind === "pull_request" && item.merged_at !== null;
      if (filter.status === "open" && (item.state !== "open" || isMerged))
        return false;
      if (filter.status === "closed" && item.state !== "closed" && !isMerged)
        return false;
    }

    if (filter.repos.length > 0 && !filter.repos.includes(item.repo))
      return false;

    if (filter.labels.length > 0) {
      const itemLabels = item.labels.map((l) => l.name);
      if (!filter.labels.some((l) => itemLabels.includes(l))) return false;
    }

    return true;
  });
}

export default function HomePage() {
  const { state, refresh } = useGitHubData();
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  const repos = getRepos();
  const hasRepos = repos.length > 0;

  const { filteredItems, availableRepos, availableLabels } = useMemo(() => {
    if (state.status !== "success") {
      return { filteredItems: [], availableRepos: [], availableLabels: [] };
    }
    const allItems = state.data;
    const reposSet = new Set(allItems.map((i) => i.repo));
    const labelsSet = new Set(
      allItems.flatMap((i) => i.labels.map((l) => l.name)),
    );
    return {
      filteredItems: applyFilter(allItems, filter),
      availableRepos: [...reposSet].sort(),
      availableLabels: [...labelsSet].sort(),
    };
  }, [state, filter]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">GitHub Issue Viewer</h1>
        <div className="flex items-center gap-3">
          {state.status === "success" && (
            <span className="text-xs text-gray-400">
              更新: {formatTime(state.fetchedAt)}
            </span>
          )}
          <button
            type="button"
            onClick={refresh}
            disabled={state.status === "loading"}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {state.status === "loading" ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : (
              <span aria-hidden>↺</span>
            )}
            更新
          </button>
          <Link
            href="/settings"
            className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            設定
          </Link>
        </div>
      </div>

      {state.status === "loading" && (
        <div className="flex justify-center items-center py-20">
          <Spinner className="text-gray-400" />
        </div>
      )}

      {state.status === "error" && (
        <div className="py-10 text-center">
          <p className="text-red-600 text-sm mb-3">{state.message}</p>
          <button
            type="button"
            onClick={refresh}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            再試行
          </button>
        </div>
      )}

      {state.status === "success" && !hasRepos && (
        <div className="py-16 text-center">
          <p className="text-gray-500 text-sm mb-3">
            設定画面でリポジトリを追加してください
          </p>
          <Link
            href="/settings"
            className="text-sm text-blue-600 hover:underline"
          >
            設定画面へ →
          </Link>
        </div>
      )}

      {state.status === "success" && hasRepos && (
        <div className="flex flex-col gap-3">
          <FilterBar
            filter={filter}
            availableRepos={availableRepos}
            availableLabels={availableLabels}
            onChange={setFilter}
          />
          <IssueList items={filteredItems} />
        </div>
      )}
    </main>
  );
}
