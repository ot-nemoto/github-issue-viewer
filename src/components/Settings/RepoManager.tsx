"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDate } from "@/lib/format";
import { getRepository } from "@/lib/github/client";
import { extractOwnerRepo } from "@/lib/github/parser";
import {
  addRepo,
  getRepos,
  getToken,
  removeRepo,
} from "@/lib/storage/settings";

type RepoDetail = {
  repo: string;
  updatedAt: string | null;
};

type SortKey = "updatedAt" | "name";
type SortDirection = "asc" | "desc";

function compareRepoDetails(
  a: RepoDetail,
  b: RepoDetail,
  key: SortKey,
  direction: SortDirection,
): number {
  if (key === "name") {
    const cmp = a.repo.localeCompare(b.repo);
    return direction === "asc" ? cmp : -cmp;
  }
  // updatedAt: 取得できなかった行は方向に関わらず常に末尾
  if (!a.updatedAt && !b.updatedAt) return 0;
  if (!a.updatedAt) return 1;
  if (!b.updatedAt) return -1;
  const cmp = a.updatedAt.localeCompare(b.updatedAt);
  return direction === "asc" ? cmp : -cmp;
}

function sortDetails(
  details: RepoDetail[],
  key: SortKey,
  direction: SortDirection,
): RepoDetail[] {
  return [...details].sort((a, b) => compareRepoDetails(a, b, key, direction));
}

// repo をキーに details へ追加または既存行の updatedAt を更新する（重複させない）。
// GitHub の owner/repo は大文字小文字を区別しないため、既存表記を保持しつつ照合する。
function upsertDetail(details: RepoDetail[], item: RepoDetail): RepoDetail[] {
  const key = item.repo.toLowerCase();
  return details.some((d) => d.repo.toLowerCase() === key)
    ? details.map((d) =>
        d.repo.toLowerCase() === key ? { ...d, updatedAt: item.updatedAt } : d,
      )
    : [...details, item];
}

function SortHeaderButton({
  label,
  columnKey,
  sortKey,
  sortDirection,
  onSort,
}: {
  label: string;
  columnKey: SortKey;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === columnKey;
  return (
    <button
      type="button"
      onClick={() => onSort(columnKey)}
      aria-label={`${label}で並び替え${active ? `（現在: ${sortDirection === "asc" ? "昇順" : "降順"}）` : ""}`}
      className="flex items-center gap-1 text-xs font-semibold text-[#636c76] hover:text-[#1f2328] transition-colors"
    >
      {label}
      {active && <span aria-hidden>{sortDirection === "asc" ? "▲" : "▼"}</span>}
    </button>
  );
}

export function RepoManager() {
  const [input, setInput] = useState("");
  const [details, setDetails] = useState<RepoDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  // 登録件数は最終更新日の取得中でも正しく出せるよう getRepos() ベースで保持する
  const [repoCount, setRepoCount] = useState(0);
  const requestIdRef = useRef(0);

  const sortedDetails = useMemo(
    () => sortDetails(details, sortKey, sortDirection),
    [details, sortKey, sortDirection],
  );

  function handleSortClick(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const loadDetails = useCallback(async (repos: string[]) => {
    const requestId = ++requestIdRef.current;
    setRepoCount(repos.length);
    setDetailsLoading(true);
    const token = getToken() ?? undefined;
    const results = await Promise.all(
      repos.map(async (repo): Promise<RepoDetail> => {
        const [owner, name] = repo.split("/");
        try {
          const data = await getRepository(owner, name, token);
          return { repo, updatedAt: data.updated_at };
        } catch {
          return { repo, updatedAt: null };
        }
      }),
    );
    // 新しい loadDetails 呼び出しに追い抜かれていた場合のみ破棄する
    if (requestId !== requestIdRef.current) return;
    // 取得中に追加/削除された分と整合させ、現在の登録リポジトリのみを残す
    // （取得済み結果を丸ごと破棄せず、ローカルの追加分を保持する）
    const current = new Set(getRepos());
    setDetails((prev) => {
      const byRepo = new Map(prev.map((d) => [d.repo, d]));
      for (const r of results) byRepo.set(r.repo, r);
      return [...byRepo.values()].filter((d) => current.has(d.repo));
    });
    setDetailsLoading(false);
  }, []);

  useEffect(() => {
    loadDetails(getRepos());
  }, [loadDetails]);

  async function handleAdd() {
    if (adding) return;
    const repo = extractOwnerRepo(input);
    if (!repo) return;

    const parts = repo.split("/");
    if (parts.length !== 2) {
      setError("owner/repo の形式で入力してください");
      return;
    }
    const [owner, name] = parts.map((p) => p.trim());
    if (!owner || !name) {
      setError("owner/repo の形式で入力してください");
      return;
    }

    setAdding(true);
    setError(null);
    try {
      const token = getToken() ?? undefined;
      const data = await getRepository(owner, name, token);
      addRepo(repo);
      // 取得済みのdataを使って1件追加・更新するだけにし、登録済み分の再取得を避ける。
      // in-flight の loadDetails は getRepos() と整合してマージするため、無効化は不要。
      setDetailsLoading(false);
      setDetails((prev) =>
        upsertDetail(prev, { repo, updatedAt: data.updated_at }),
      );
      setRepoCount(getRepos().length);
      setInput("");
    } catch {
      setError(
        "リポジトリが見つかりません、またはアクセス権限がありません（プライベートリポジトリにはトークンが必要です）",
      );
    } finally {
      setAdding(false);
    }
  }

  function handleRemove(repo: string) {
    removeRepo(repo);
    // in-flight の loadDetails は getRepos() で整合するため、削除は即時反映のみでよい
    setDetailsLoading(false);
    setDetails((prev) => prev.filter((d) => d.repo !== repo));
    setRepoCount(getRepos().length);
  }

  return (
    <section className="bg-white rounded-md border border-[#d0d7de] p-5">
      <h2
        id="repo-section-label"
        className="text-sm font-semibold text-[#1f2328] mb-3"
      >
        リポジトリ{" "}
        <span className="font-normal text-[#636c76]">({repoCount})</span>
      </h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !adding) handleAdd();
          }}
          placeholder="owner/repo"
          aria-label="リポジトリ名 (owner/repo 形式)"
          className="flex-1 px-3 py-1.5 border border-[#d0d7de] rounded-md text-sm text-[#1f2328] focus:outline-none focus:ring-2 focus:ring-[#0969da] focus:border-[#0969da]"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!input.trim() || adding}
          className="px-4 py-1.5 text-sm font-semibold bg-[#0969da] text-white rounded-md hover:bg-[#0860ca] disabled:opacity-50 disabled:cursor-not-allowed border border-black/10 transition-colors"
        >
          {adding ? "追加中..." : "追加"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-[#cf222e]">✗ {error}</p>}
      {detailsLoading && (
        <p className="mt-4 text-sm text-[#636c76]">読み込み中...</p>
      )}
      {!detailsLoading && details.length > 0 && (
        <>
          <div className="flex items-center justify-between mt-4 px-1">
            <SortHeaderButton
              label="リポジトリ名"
              columnKey="name"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSortClick}
            />
            <SortHeaderButton
              label="最終更新日"
              columnKey="updatedAt"
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={handleSortClick}
            />
          </div>
          <ul className="mt-2 max-h-[40vh] overflow-y-auto divide-y divide-[#d0d7de]">
            {sortedDetails.map(({ repo, updatedAt }) => (
              <li key={repo} className="flex items-center justify-between py-2">
                <span className="text-sm font-mono text-[#1f2328]">{repo}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#636c76]">
                    {updatedAt
                      ? `最終更新: ${formatDate(updatedAt)}`
                      : "最終更新日を取得できません"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(repo)}
                    aria-label={`${repo} を削除`}
                    className="px-3 py-1 text-sm font-semibold bg-white text-[#cf222e] border border-[#d0d7de] rounded-md hover:bg-[#ffebe9] hover:border-[#cf222e] transition-colors"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {!detailsLoading && details.length === 0 && (
        <p className="mt-4 text-sm text-[#636c76]">
          リポジトリが登録されていません
        </p>
      )}
    </section>
  );
}
