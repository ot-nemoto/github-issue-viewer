# Architecture

## 技術スタック

| カテゴリ | 技術 | バージョン |
|----------|------|-----------|
| フレームワーク | Next.js (App Router) | 15.x |
| 言語 | TypeScript | 5.x |
| スタイリング | Tailwind CSS | 4.x |
| リンター / フォーマッター | Biome | 1.x |
| テスト | Vitest | 3.x |
| パッケージマネージャー | npm | - |
| デプロイ | GitHub Pages（静的エクスポート） | - |

## ディレクトリ構成

```
src/
  app/
    page.tsx              # メインリスト画面
    layout.tsx            # ルートレイアウト
    settings/
      page.tsx            # 設定画面
  components/
    IssueList/
      IssueList.tsx       # リスト全体（フィルタ済みアイテムの表示）
      IssueItem.tsx       # 1行分のアイテム
    FilterBar/
      FilterBar.tsx       # フィルタUI（タイプ・ステータス・リポジトリ・ラベル）
    Settings/
      TokenForm.tsx       # PAT入力・検証フォーム
      RepoManager.tsx     # リポジトリ追加・削除
    ui/                   # 汎用UIコンポーネント（Button, Badge, Spinner等）
  lib/
    github/
      client.ts           # GitHub API クライアント（fetch ラッパー）
      types.ts            # GitHub API レスポンス型
      parser.ts           # PR本文から関連Issueを抽出
    storage/
      cache.ts            # localStorage キャッシュ（TTL付き）
      settings.ts         # PAT・リポジトリリストの永続化
    hooks/
      useGitHubData.ts    # データ取得・キャッシュ管理フック
      useSettings.ts      # 設定の読み書きフック
  types/
    index.ts              # アプリ共通型定義
docs/
public/
```

## 静的エクスポートとパス設定

### next.config.ts

```ts
const isStatic = process.env.BUILD_MODE === "static";

export default {
  ...(isStatic && {
    output: "export",
    basePath: "/github-issue-viewer",
    assetPrefix: "/github-issue-viewer",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};
```

### 環境別の動作

| 環境 | コマンド | BUILD_MODE | URL |
|------|----------|------------|-----|
| ローカル開発 | `npm run dev` | 未設定 | `http://localhost:3000/` |
| GitHub Pages ビルド | `npm run build:static` | `static` | `https://ot-nemoto.github.io/github-issue-viewer/` |

### package.json スクリプト

```json
{
  "dev": "next dev",
  "build": "next build",
  "build:static": "cross-env BUILD_MODE=static next build",
  "start": "next start",
  "lint": "biome check .",
  "test": "vitest run"
}
```

## localStorage キー設計

| キー | 型 | 内容 |
|------|-----|------|
| `giv:token` | `string` | GitHub PAT |
| `giv:repos` | `string[]` | リポジトリリスト（`owner/repo` 形式） |
| `giv:cache:{owner}/{repo}` | `CacheEntry` | リポジトリ別キャッシュ |

### CacheEntry 型

```ts
type CacheEntry = {
  data: GitHubItem[];   // 取得済みのIssue+PRリスト
  timestamp: number;    // Unix ms
  etag?: string;        // GitHub APIのETag（将来的な条件付きリクエスト用）
};
```

## GitHub API 利用方針

- エンドポイント: GitHub REST API v3
- Issue: `GET /repos/{owner}/{repo}/issues?state=all&per_page=100&page={n}`
- PR: `GET /repos/{owner}/{repo}/pulls?state=all&per_page=100&page={n}`
- ユーザー検証: `GET /user`
- 認証: `Authorization: Bearer {token}` ヘッダー
- ページネーション: `Link` ヘッダーを解析して全件取得
- レート制限: キャッシュにより不要なリクエストを削減

## バージョン固有の仕様・既知注意点

- **Next.js 15 + App Router**: `'use client'` を付けないコンポーネントはデフォルトで Server Component。`localStorage` アクセスは Client Component で行う必要がある。
- **`output: 'export'`**: `next dev` 時は影響なし。`next build` 時に `./out` へ静的ファイルを出力する。API Routes（Route Handlers）は静的エクスポートでは使用不可。
- **Tailwind CSS 4.x**: `@tailwind` ディレクティブではなく `@import "tailwindcss"` を使用する。`tailwind.config.js` ではなく `CSS-first` 設定が推奨。
- **Biome**: ESLint / Prettier の代替。`biome check .` でリント・フォーマット両方をチェックする。
