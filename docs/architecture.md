# Architecture

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| リンター / フォーマッター | Biome |
| テスト | Vitest |
| パッケージマネージャー | npm |
| デプロイ | GitHub Pages（静的エクスポート） |

> バージョンは `package.json` を正とする（この表には記載しない）。

## 実装方針

- レイヤー構成: `app/`（画面）→ `components/`（UI）→ `lib/`（ロジック: GitHub API クライアント・localStorage・フック）。ディレクトリ・ファイル構成の詳細はコードを正とする
- フロントは薄く保ち、非自明なロジックは `lib/` に切り出してユニットテスト対象とする

## 静的エクスポートとパス設定

`next.config.ts` で `BUILD_MODE=static` のときのみ静的エクスポート設定（`output: "export"`・`basePath` / `assetPrefix` によるサブパス・`trailingSlash`・画像最適化無効）を有効化する。ローカル開発（`npm run dev`）ではサブパスなしのルートで動作させたいため、環境変数で切り替える方針とする。

### 環境別の動作

| 環境 | コマンド | BUILD_MODE | URL |
|------|----------|------------|-----|
| ローカル開発 | `npm run dev` | 未設定 | `http://localhost:3000/` |
| GitHub Pages ビルド | `npm run build:static` | `static` | `https://ot-nemoto.github.io/github-issue-viewer/` |

> スクリプトの定義は `package.json` を正とする。各コマンドの用途は [`docs/development.md`](development.md) を参照。

## localStorage キー設計

| キー | 型 | 内容 |
|------|-----|------|
| `giv:token` | `string` | GitHub PAT |
| `giv:repos` | `string[]` | リポジトリリスト（`owner/repo` 形式） |
| `giv:cache:{owner}/{repo}` | `CacheEntry` | リポジトリ別キャッシュ（TTL 付き。既定 5 分） |

> `CacheEntry` 型の定義はコード（`src/lib/storage/cache.ts`）を正とする。

## GitHub API 利用方針

- エンドポイント: GitHub REST API v3
- Issue: `GET /repos/{owner}/{repo}/issues?state=all&per_page=100&page={n}`
- PR: `GET /repos/{owner}/{repo}/pulls?state=all&per_page=100&page={n}`
- ユーザー検証: `GET /user`
- 認証: `Authorization: Bearer {token}` ヘッダー
- PAT 必要スコープ: `repo`（プライベートリポジトリ読み取り）、`read:org`（組織リポジトリ読み取り）
- ページネーション: `Link` ヘッダーを解析して全件取得
- レート制限: キャッシュにより不要なリクエストを削減（認証済み: 5,000 req/hour）

### 関連 Issue 抽出

PR 本文から以下のパターンを抽出して関連 Issue として表示する（大文字小文字不問）。

- `Closes #123` / `Fixes #123` / `Resolves #123`
- `Closes owner/repo#123` 形式（別リポジトリ参照）

## バージョン固有の仕様・既知注意点

- **Next.js App Router**: `'use client'` を付けないコンポーネントはデフォルトで Server Component。`localStorage` アクセスは Client Component で行う必要がある。
- **`output: 'export'`**: `next dev` 時は影響なし。`next build` 時に `./out` へ静的ファイルを出力する。API Routes（Route Handlers）は静的エクスポートでは使用不可。
- **Tailwind CSS v4**: `@tailwind` ディレクティブではなく `@import "tailwindcss"` を使用する。`tailwind.config.js` ではなく `CSS-first` 設定が推奨。
- **Biome**: ESLint / Prettier の代替。`biome check .` でリント・フォーマット両方をチェックする。
