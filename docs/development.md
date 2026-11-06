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

## GitHub PAT の発行

アプリはプライベートリポジトリの読み取りに GitHub の Personal Access Token（PAT）を使用する。トークンはブラウザの `localStorage` に平文で保持されるため、**漏洩時の被害範囲と有効時間を最小化する発行方法**を推奨する（設計上の根拠は [architecture.md](architecture.md) を参照）。

### 推奨: Fine-grained personal access token

1. [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new) を開く
2. **Expiration**: 短め（90 日以内など）に設定する
3. **Repository access**: `Only select repositories` を選び、閲覧したいリポジトリのみを指定する
4. **Repository permissions**: 以下を `Read-only` に設定する（Metadata は自動で付与される）
   - Contents
   - Issues
   - Pull requests
5. 発行したトークンをアプリの設定画面「GitHub Token」に貼り付けて「検証」する

> classic PAT を使う場合は `repo`（プライベート読み取り）/ `read:org`（組織リポジトリ読み取り）スコープが必要だが、権限が広くなるため Fine-grained PAT を優先する。

## スクリプト

| コマンド | 内容 |
|---------|------|
| `npm run dev` | 開発サーバー起動（ホットリロード） |
| `npm run build` | 通常ビルド（動作確認・CI 用） |
| `npm run build:static` | 静的エクスポートビルド（`./out` に出力）|
| `npm run lint` | Biome によるリント・フォーマットチェック |
| `npm run test` | Vitest によるユニットテスト実行 |

## デプロイ手順

### GitHub Pages

`develop` ブランチへの push または `workflow_dispatch` で自動デプロイされる。`deploy-github-pages.yml` は `ci.yml` に依存しておらず、CI の成否とは無関係に実行される。

```
develop ブランチへ push
  → build:static（./out 生成）
  → GitHub Pages デプロイ
```

デプロイ先: `https://ot-nemoto.github.io/github-issue-viewer/`
