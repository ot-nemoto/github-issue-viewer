"use client";

import { useEffect, useState } from "react";
import { validateToken } from "@/lib/github/client";
import { getToken, removeToken, setToken } from "@/lib/storage/settings";

type ValidationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; username: string }
  | { status: "error"; message: string };

export function TokenForm() {
  const [input, setInput] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
  });

  useEffect(() => {
    const token = getToken();
    if (token) {
      setInput(token);
      setHasToken(true);
    }
  }, []);

  async function handleValidate() {
    const token = input.trim();
    if (!token) return;
    setValidation({ status: "loading" });
    try {
      const user = await validateToken(token);
      setToken(token);
      setHasToken(true);
      setValidation({ status: "success", username: user.login });
    } catch {
      setValidation({ status: "error", message: "トークンが無効です" });
    }
  }

  function handleRemove() {
    removeToken();
    setInput("");
    setHasToken(false);
    setValidation({ status: "idle" });
  }

  return (
    <section className="bg-white rounded-md border border-[#d0d7de] p-5">
      <h2
        id="token-section-label"
        className="text-sm font-semibold text-[#1f2328] mb-3"
      >
        GitHub Token
      </h2>
      <div className="flex gap-2">
        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setValidation({ status: "idle" });
          }}
          aria-labelledby="token-section-label"
          placeholder="ghp_xxxxxxxxxxxx"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 px-3 py-1.5 border border-[#d0d7de] rounded-md text-sm text-[#1f2328] focus:outline-none focus:ring-2 focus:ring-[#0969da] focus:border-[#0969da]"
        />
        <button
          type="button"
          onClick={handleValidate}
          disabled={!input.trim() || validation.status === "loading"}
          className="px-4 py-1.5 text-sm font-semibold bg-[#0969da] text-white rounded-md hover:bg-[#0860ca] disabled:opacity-50 disabled:cursor-not-allowed border border-black/10 transition-colors"
        >
          {validation.status === "loading" ? "検証中..." : "検証"}
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={!hasToken}
          className="px-4 py-1.5 text-sm font-semibold bg-white text-[#cf222e] border border-[#d0d7de] rounded-md hover:bg-[#ffebe9] hover:border-[#cf222e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          削除
        </button>
      </div>
      {validation.status === "success" && (
        <p className="mt-2 text-sm text-[#1a7f37]">
          ✓ @{validation.username} として認証済み
        </p>
      )}
      {validation.status === "error" && (
        <p className="mt-2 text-sm text-[#cf222e]">✗ {validation.message}</p>
      )}
    </section>
  );
}
