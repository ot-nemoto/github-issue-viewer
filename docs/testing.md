# Testing

## テスト種別

| 種別 | ツール | 対象 |
|------|--------|------|
| ユニットテスト | Vitest | `lib/` 配下のユーティリティ・API クライアント |
| 手動動作確認 | ブラウザ | UI コンポーネント・画面全体 |

## 完了条件

- `lib/` 配下のすべてのユーティリティ関数にユニットテストを作成する
- API クライアント（`lib/github/client.ts`）のテストを作成する
- UI コンポーネントのユニットテストは必須としない

## カバレッジ方針

以下を必ずテストする：

| 対象 | テスト内容 |
|------|-----------|
| `lib/github/client.ts` | 正常レスポンス、エラーハンドリング（401, 403, 404, 429）、ページネーション |
| `lib/github/parser.ts` | `Closes #123`, `Fixes owner/repo#123` などのパターン抽出 |
| `lib/storage/cache.ts` | キャッシュ保存・取得・TTL 期限切れ判定・クリア |
| `lib/storage/settings.ts` | PAT・リポジトリリストの保存・取得・削除 |

## 実行手順

```bash
# テスト実行
npm run test

# ウォッチモード
npx vitest
```

## テストファイル配置

`src/` 内の対象ファイルと同階層に `*.test.ts` を配置する。

```
src/lib/github/client.ts
src/lib/github/client.test.ts
src/lib/github/parser.ts
src/lib/github/parser.test.ts
src/lib/storage/cache.ts
src/lib/storage/cache.test.ts
src/lib/storage/settings.ts
src/lib/storage/settings.test.ts
```
