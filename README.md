# GitHub Issue Viewer

複数の GitHub リポジトリにまたがる Issue と Pull Request を一覧表示する個人向けビューアアプリ。

## 機能

- 複数リポジトリの Issue / PR を統合リスト表示
- Personal Access Token（PAT）によるプライベートリポジトリ対応
- タイプ・ステータス・リポジトリ・ラベルによるフィルタリング
- API レスポンスのローカルキャッシュ（デフォルト5分、手動更新可）
- PR 本文からの関連 Issue 自動抽出

## ドキュメント

| ドキュメント | 内容 |
|------------|------|
| [docs/product.md](docs/product.md) | プロダクト目的・対象ユーザー・成功指標 |
| [docs/requirements.md](docs/requirements.md) | 機能要件・非機能要件 |
| [docs/architecture.md](docs/architecture.md) | 技術スタック・ディレクトリ構成・実装方針 |
| [docs/ui.md](docs/ui.md) | 画面仕様・遷移図・コンポーネント一覧 |
| [docs/development.md](docs/development.md) | ローカルセットアップ・デプロイ手順 |
| [docs/testing.md](docs/testing.md) | テスト方針・カバレッジ規約 |
| [docs/e2e-scenarios.md](docs/e2e-scenarios.md) | 手動動作確認シナリオ |
| [docs/tasks.md](docs/tasks.md) | フェーズ別タスク一覧 |

## クイックスタート

```bash
npm install
npm run dev
# → http://localhost:3000/
```

詳細は [docs/development.md](docs/development.md) を参照。
