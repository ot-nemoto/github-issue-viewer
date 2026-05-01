import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold">設定</h1>
      </div>
      <p className="text-gray-500">設定画面（実装予定）</p>
    </main>
  );
}
