"use client";

import type { GitHubItem } from "@/types";
import { useState } from "react";
import { IssueItem } from "./IssueItem";

type IssueListProps = {
  items: GitHubItem[];
};

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return collapsed ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 10.5a.75.75 0 0 1-.53-.22l-4-4a.75.75 0 0 1 1.06-1.06L8 8.69l3.47-3.47a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-.53.22Z" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.47 5.28a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1-1.06 1.06L8 6.81 4.53 10.28a.75.75 0 0 1-1.06-1.06l4-4Z" />
    </svg>
  );
}

export function IssueList({ items }: IssueListProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-[#636c76]">
        該当するアイテムがありません
      </div>
    );
  }

  // リポジトリ順を維持しつつグループ化
  const repoOrder: string[] = [];
  const grouped: Record<string, GitHubItem[]> = {};
  for (const item of items) {
    if (!grouped[item.repo]) {
      repoOrder.push(item.repo);
      grouped[item.repo] = [];
    }
    grouped[item.repo].push(item);
  }

  const toggleCollapse = (repo: string) => {
    setCollapsed((prev) => ({ ...prev, [repo]: !prev[repo] }));
  };

  return (
    <div className="space-y-3">
      {repoOrder.map((repo) => {
        const repoItems = grouped[repo];
        const isCollapsed = collapsed[repo] ?? false;

        return (
          <div
            key={repo}
            className="bg-white border border-[#d0d7de] rounded-md overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#f6f8fa] border-b border-[#d0d7de]">
              <div className="flex items-center gap-2">
                <a
                  href={`https://github.com/${repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[#0969da] hover:underline"
                >
                  {repo}
                </a>
                <span className="text-xs text-[#636c76]">
                  {repoItems.length} 件
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleCollapse(repo)}
                aria-label={
                  isCollapsed ? `${repo} を展開` : `${repo} を折りたたむ`
                }
                className="text-[#636c76] hover:text-[#1f2328] transition-colors"
              >
                <ChevronIcon collapsed={isCollapsed} />
              </button>
            </div>
            {!isCollapsed && (
              <div>
                {repoItems.map((item) => (
                  <IssueItem key={`${item.kind}-${item.id}`} item={item} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
