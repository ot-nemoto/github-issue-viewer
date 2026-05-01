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

    const [owner, name] = repo.split("/");
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
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 id="repo-section-label" className="text-lg font-semibold mb-4">
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
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!input.trim() || adding}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? "追加中..." : "追加"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">✗ {error}</p>}
      {repos.length > 0 && (
        <ul className="mt-4 divide-y divide-gray-100">
          {repos.map((repo) => (
            <li key={repo} className="flex items-center justify-between py-2">
              <span className="text-sm font-mono">{repo}</span>
              <button
                type="button"
                onClick={() => handleRemove(repo)}
                aria-label={`${repo} を削除`}
                className="text-sm text-red-600 hover:text-red-800"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
      {repos.length === 0 && (
        <p className="mt-4 text-sm text-gray-400">
          リポジトリが登録されていません
        </p>
      )}
    </section>
  );
}
