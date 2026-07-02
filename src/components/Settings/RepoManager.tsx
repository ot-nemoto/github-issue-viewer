"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

function sortByUpdatedAtDesc(details: RepoDetail[]): RepoDetail[] {
  return [...details].sort((a, b) => {
    if (!a.updatedAt && !b.updatedAt) return 0;
    if (!a.updatedAt) return 1;
    if (!b.updatedAt) return -1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function RepoManager() {
  const [input, setInput] = useState("");
  const [details, setDetails] = useState<RepoDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadDetails = useCallback(async (repos: string[]) => {
    const requestId = ++requestIdRef.current;
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
    // 古い呼び出しの結果が後から解決した場合は破棄し、最新の結果を上書きしないようにする
    if (requestId !== requestIdRef.current) return;
    setDetails(sortByUpdatedAtDesc(results));
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
      // 取得済みのdataを使って1件追加するだけにし、登録済み分の再取得を避ける
      requestIdRef.current++;
      setDetailsLoading(false);
      setDetails((prev) =>
        sortByUpdatedAtDesc([...prev, { repo, updatedAt: data.updated_at }]),
      );
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
    // in-flight の loadDetails が削除後に解決してもこの変更を上書きしないようにする
    requestIdRef.current++;
    setDetailsLoading(false);
    setDetails((prev) => prev.filter((d) => d.repo !== repo));
  }

  return (
    <section className="bg-white rounded-md border border-[#d0d7de] p-5">
      <h2
        id="repo-section-label"
        className="text-sm font-semibold text-[#1f2328] mb-3"
      >
        リポジトリ
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
        <ul className="mt-4 divide-y divide-[#d0d7de]">
          {details.map(({ repo, updatedAt }) => (
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
                  className="text-sm text-[#cf222e] hover:text-[#a40e26] transition-colors"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!detailsLoading && details.length === 0 && (
        <p className="mt-4 text-sm text-[#636c76]">
          リポジトリが登録されていません
        </p>
      )}
    </section>
  );
}
