# Development

## ローカルセットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動（http://localhost:3000/）
npm run dev
```

## 環境変数

アプリ固有の環境変数はない。basePath の切り替えは `BUILD_MODE` で制御する（`next.config.ts` 参照）。

`.env.local` はローカル開発用途（API キーなど）に使用できるが、現時点では必須項目なし。

## スクリプト

| コマンド | 内容 |
|---------|------|
| `npm run dev` | 開発サーバー起動（ホットリロード） |
| `npm run build` | 通常ビルド（動作確認・CI 用） |
| `npm run build:static` | 静的エクスポートビルド（`./out` に出力）|
| `npm run lint` | Biome によるリント・フォーマットチェック |
| `npm run test` | Vitest によるユニットテスト実行 |

## CI

`.github/workflows/ci.yml` は以下のタイミングで実行される。

| トリガー | 実行 |
|---------|------|
| PR オープン（`opened` / `reopened`） | 自動実行 |
| レビュー対応コミットのプッシュ（`synchronize`） | 自動実行しない |
| 手動実行（`workflow_dispatch`） | いつでも実行可能 |

`develop` / `master` に branch protection（必須ステータスチェック）は設定されていないため、CI 結果はマージのブロック要因にならない。**マージ前には GitHub Actions タブから手動でCIを再実行し、最終確認を行うこと。**

## デプロイ手順

### GitHub Pages

`develop` ブランチへの push または `workflow_dispatch` で自動デプロイされる。

```
develop ブランチへ push
  → CI（lint + test）パス
  → build:static（./out 生成）
  → GitHub Pages デプロイ
```

デプロイ先: `https://ot-nemoto.github.io/github-issue-viewer/`
