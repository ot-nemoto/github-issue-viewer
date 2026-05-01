import { RepoManager } from "@/components/Settings/RepoManager";
import { TokenForm } from "@/components/Settings/TokenForm";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← メインリストへ戻る
        </Link>
        <h1 className="text-2xl font-bold">設定</h1>
      </div>
      <div className="flex flex-col gap-6">
        <TokenForm />
        <RepoManager />
      </div>
    </main>
  );
}
