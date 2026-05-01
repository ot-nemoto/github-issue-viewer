# Tasks

タスクの状態は GitHub Issues で確認する。

## フェーズ別マイルストーン

| フェーズ | Milestone | 内容 |
|---------|-----------|------|
| Phase 1 | [Phase 1: プロジェクト基盤](https://github.com/ot-nemoto/github-issue-viewer/milestone/1) | Next.jsセットアップ、APIクライアント、ストレージユーティリティ |
| Phase 2 | [Phase 2: 設定機能](https://github.com/ot-nemoto/github-issue-viewer/milestone/2) | PAT設定・リポジトリ管理UI |
| Phase 3 | [Phase 3: メインリスト機能](https://github.com/ot-nemoto/github-issue-viewer/milestone/3) | Issue/PRリスト表示・フィルタ・関連Issue抽出 |
| Phase 4 | [Phase 4: 品質・デプロイ](https://github.com/ot-nemoto/github-issue-viewer/milestone/4) | ユニットテスト・GitHub Pages デプロイ確認 |

## Issue 一覧

| T番号 | Issue | フェーズ | 依存 |
|-------|-------|---------|------|
| T1 | [Next.js プロジェクト初期セットアップ](https://github.com/ot-nemoto/github-issue-viewer/issues/1) | Phase 1 | - |
| T2 | [GitHub API クライアント実装](https://github.com/ot-nemoto/github-issue-viewer/issues/2) | Phase 1 | T1 |
| T3 | [localStorage ユーティリティ実装](https://github.com/ot-nemoto/github-issue-viewer/issues/3) | Phase 1 | T1 |
| T4 | [設定画面 UI 実装](https://github.com/ot-nemoto/github-issue-viewer/issues/4) | Phase 2 | T2, T3 |
| T5 | [Issue/PR データ取得・マージロジック実装](https://github.com/ot-nemoto/github-issue-viewer/issues/5) | Phase 3 | T2, T3 |
| T6 | [メインリスト画面 UI 実装](https://github.com/ot-nemoto/github-issue-viewer/issues/6) | Phase 3 | T5 |
| T7 | [ユニットテスト整備](https://github.com/ot-nemoto/github-issue-viewer/issues/7) | Phase 4 | T2, T3, T5 |
| T8 | [GitHub Pages デプロイ確認](https://github.com/ot-nemoto/github-issue-viewer/issues/8) | Phase 4 | T6 |
