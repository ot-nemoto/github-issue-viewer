"use client";

import { validateToken } from "@/lib/github/client";
import { getToken, removeToken, setToken } from "@/lib/storage/settings";
import { useEffect, useState } from "react";

type ValidationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; username: string }
  | { status: "error"; message: string };

export function TokenForm() {
  const [input, setInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
  });

  useEffect(() => {
    const token = getToken();
    if (token) {
      setInput(token);
      setSaved(true);
    }
  }, []);

  async function handleValidate() {
    const token = input.trim();
    if (!token) return;
    setValidation({ status: "loading" });
    try {
      const user = await validateToken(token);
      setToken(token);
      setSaved(true);
      setValidation({ status: "success", username: user.login });
    } catch {
      setValidation({ status: "error", message: "トークンが無効です" });
    }
  }

  function handleRemove() {
    removeToken();
    setInput("");
    setSaved(false);
    setValidation({ status: "idle" });
  }

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">GitHub Token</h2>
      <div className="flex gap-2">
        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setSaved(false);
            setValidation({ status: "idle" });
          }}
          placeholder="ghp_xxxxxxxxxxxx"
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleValidate}
          disabled={!input.trim() || validation.status === "loading"}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validation.status === "loading" ? "検証中..." : "検証"}
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={!saved}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          削除
        </button>
      </div>
      {validation.status === "success" && (
        <p className="mt-2 text-sm text-green-600">
          ✓ @{validation.username} として認証済み
        </p>
      )}
      {validation.status === "error" && (
        <p className="mt-2 text-sm text-red-600">✗ {validation.message}</p>
      )}
    </section>
  );
}
