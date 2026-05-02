"use client";

import { useEffect, useRef } from "react";
import { RepoManager } from "./RepoManager";
import { TokenForm } from "./TokenForm";

type SettingsModalProps = {
  onClose: () => void;
};

export function SettingsModal({ onClose }: SettingsModalProps) {
  // モーダルを開く前のフォーカス先を保存し、閉じたときに戻す
  const previousFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  // Esc キーで閉じる
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (
          (e.key === "Enter" || e.key === " ") &&
          e.target === e.currentTarget
        )
          onClose();
      }}
    >
      <dialog
        open
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="relative w-full max-w-2xl mx-4 bg-[#f6f8fa] rounded-lg shadow-xl p-0 border-0"
      >
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#d0d7de]">
          <h2
            id="settings-modal-title"
            className="text-base font-semibold text-[#1f2328]"
          >
            設定
          </h2>
          <button
            type="button"
            // biome-ignore lint/a11y/noAutofocus: モーダル表示時のフォーカス初期位置として意図的に設定
            autoFocus
            onClick={onClose}
            aria-label="設定を閉じる"
            className="text-[#636c76] hover:text-[#1f2328] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        </div>

        {/* モーダル本体 */}
        <div className="p-5 space-y-4">
          <TokenForm />
          <RepoManager />
        </div>
      </dialog>
    </div>
  );
}
