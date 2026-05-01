# Development

## ローカルセットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動（http://localhost:3000/）
npm run dev
```

## 環境変数

### .env.local（ローカル開発用、Git 管理外）

```env
# ローカルでは basePath を空にする（GitHub Pages 用のサブパスを使わない）
NEXT_PUBLIC_BASE_PATH=
```

> `NEXT_PUBLIC_BASE_PATH` を未設定・空にすると `http://localhost:3000/` でルートアクセスできる。

### GitHub Actions（CI/CD）

`deploy-github-pages.yml` のビルドステップで以下を設定する：

```yaml
env:
  NEXT_PUBLIC_BASE_PATH: /github-issue-viewer
```

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

`develop` ブランチへの push または `workflow_dispatch` で自動デプロイされる。

```
develop ブランチへ push
  → CI（lint + test）パス
  → build:static（./out 生成）
  → GitHub Pages デプロイ
```

デプロイ先: `https://ot-nemoto.github.io/github-issue-viewer/`
