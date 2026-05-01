import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">GitHub Issue Viewer</h1>
        <Link
          href="/settings"
          className="px-4 py-2 text-sm bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          設定
        </Link>
      </div>
      <p className="text-gray-500">
        設定画面でトークンとリポジトリを設定してください。
      </p>
    </main>
  );
}
