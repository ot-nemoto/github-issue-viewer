"use client";

import { FilterBar, type FilterState } from "@/components/FilterBar/FilterBar";
import { IssueList } from "@/components/IssueList/IssueList";
import { SettingsModal } from "@/components/Settings/SettingsModal";
import { Spinner } from "@/components/ui/Spinner";
import { useGitHubData } from "@/lib/hooks/useGitHubData";
import { getLabelColor } from "@/lib/labelColor";
import type { GitHubItem } from "@/types";
import { useMemo, useState } from "react";

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

const DEFAULT_FILTER: FilterState = {
  types: ["issue", "pull_request"],
  statuses: ["open"],
  labels: [],
};

function applyFilter(items: GitHubItem[], filter: FilterState): GitHubItem[] {
  return items.filter((item) => {
    // 未選択 = 該当なし
    if (!filter.types.includes(item.kind)) return false;

    if (filter.statuses.length === 0) return false;
    const isMerged = item.kind === "pull_request" && item.merged_at !== null;
    const matchesOpen =
      filter.statuses.includes("open") && item.state === "open" && !isMerged;
    const matchesClosed =
      filter.statuses.includes("closed") &&
      (item.state === "closed" || isMerged);
    if (!matchesOpen && !matchesClosed) return false;

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
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { filteredItems, availableLabels } = useMemo(() => {
    if (state.status !== "success") {
      return { filteredItems: [], availableLabels: [] };
    }
    const allItems = state.data;
    // ラベル名を収集してアプリ固有の色を割り当てる
    const labelNames = [
      ...new Set(allItems.flatMap((i) => i.labels.map((l) => l.name))),
    ].sort();
    const availableLabels = labelNames.map((name) => ({
      name,
      color: getLabelColor(name),
    }));
    return {
      filteredItems: applyFilter(allItems, filter),
      availableLabels,
    };
  }, [state, filter]);

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <header className="h-12 bg-[#24292f] flex items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <svg
            width="22"
            height="22"
            viewBox="0 0 16 16"
            fill="rgba(255,255,255,0.9)"
            aria-hidden="true"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span className="text-[15px] font-semibold text-[#e6edf3] tracking-tight">
            Issue Viewer
          </span>
        </div>
        <div className="flex items-center gap-3">
          {state.status === "success" && (
            <span className="text-xs text-[#8b949e]">
              更新: {formatTime(state.fetchedAt)}
            </span>
          )}
          <button
            type="button"
            onClick={refresh}
            disabled={state.status === "loading"}
            className="flex items-center gap-1.5 px-3 py-1 text-sm bg-white border border-[#d0d7de] rounded-md text-[#1f2328] hover:bg-[#f6f8fa] disabled:opacity-50 transition-colors"
          >
            {state.status === "loading" ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : (
              <span aria-hidden>↺</span>
            )}
            更新
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="px-3 py-1 text-sm bg-white border border-[#d0d7de] rounded-md text-[#1f2328] hover:bg-[#f6f8fa] transition-colors"
          >
            設定
          </button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto p-5 space-y-4">
        {state.status === "loading" && (
          <div className="flex justify-center items-center py-20">
            <Spinner className="text-[#636c76]" />
          </div>
        )}

        {state.status === "error" && (
          <div className="py-10 text-center">
            <p className="text-sm text-[#cf222e] mb-3">{state.message}</p>
            <button
              type="button"
              onClick={refresh}
              className="px-4 py-1.5 text-sm bg-[#cf222e] text-white rounded-md hover:bg-[#a40e26] transition-colors"
            >
              再試行
            </button>
          </div>
        )}

        {state.status === "success" && !state.hasRepos && (
          <div className="py-16 text-center">
            <p className="text-sm text-[#636c76] mb-3">
              設定画面でリポジトリを追加してください
            </p>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="text-sm text-[#0969da] hover:underline"
            >
              設定画面へ →
            </button>
          </div>
        )}

        {state.status === "success" && state.hasRepos && (
          <div className="space-y-3">
            <FilterBar
              filter={filter}
              availableLabels={availableLabels}
              onChange={setFilter}
            />
            <IssueList items={filteredItems} />
          </div>
        )}
      </main>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
