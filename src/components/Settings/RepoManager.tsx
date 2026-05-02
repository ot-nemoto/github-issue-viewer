"use client";

import { getRepository } from "@/lib/github/client";
import {
  addRepo,
  getRepos,
  getToken,
  removeRepo,
} from "@/lib/storage/settings";
import { useEffect, useState } from "react";

export function RepoManager() {
  const [input, setInput] = useState("");
  const [repos, setRepos] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRepos(getRepos());
  }, []);

  async function handleAdd() {
    if (adding) return;
    const repo = input.trim();
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
      await getRepository(owner, name, token);
      addRepo(repo);
      setRepos(getRepos());
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
    setRepos(getRepos());
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
      {repos.length > 0 && (
        <ul className="mt-4 divide-y divide-[#d0d7de]">
          {repos.map((repo) => (
            <li key={repo} className="flex items-center justify-between py-2">
              <span className="text-sm font-mono text-[#1f2328]">{repo}</span>
              <button
                type="button"
                onClick={() => handleRemove(repo)}
                aria-label={`${repo} を削除`}
                className="text-sm text-[#cf222e] hover:text-[#a40e26] transition-colors"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
      {repos.length === 0 && (
        <p className="mt-4 text-sm text-[#636c76]">
          リポジトリが登録されていません
        </p>
      )}
    </section>
  );
}
