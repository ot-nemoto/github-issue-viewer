# GitHub Issue Viewer

複数の GitHub リポジトリにまたがる Issue と Pull Request を一覧表示する個人向けビューアアプリ。

## 機能

- 複数リポジトリの Issue / PR を統合リスト表示（リポジトリごとにグループ化・折りたたみ対応）
- Personal Access Token（PAT）によるプライベートリポジトリ対応
- 対象リポジトリの動的な追加・削除（ブラウザ保存）
- タイプ・ステータス・ラベルによるフィルタリング（複数選択可）
- API レスポンスのローカルキャッシュ（デフォルト5分、手動更新可）
- PR 本文からの関連 Issue 自動抽出

## ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [docs/product.md](docs/product.md) | プロダクト目的・対象ユーザー・成功指標 |
| [docs/architecture.md](docs/architecture.md) | 技術スタック・実装方針・GitHub API 利用方針 |
| [docs/ui.md](docs/ui.md) | 画面仕様・遷移図・UI 規約 |
| [docs/development.md](docs/development.md) | ローカルセットアップ・デプロイ手順 |

## クイックスタート

```bash
npm install
npm run dev
# → http://localhost:3000/
```

詳細は [docs/development.md](docs/development.md) を参照。
