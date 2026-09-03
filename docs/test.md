# Voice BBS Web — テスト方針 (vitest / agentic TDD)

> 目的: リファクタと機能追加を安全に進める土台。エージェント(本リポジトリでのAI開発)が **テストを先に書き、緑→リファクタを回す** ための規約を定める。
> 現状のスタック実態は `docs/STACK.md`、設計は `docs/spec.md`。

## 1. 現状と目標

- 現状: テスト基盤なし (`package.json` に test script なし)。lint のみ。
- 目標: vitest 導入。まず**純関数・境界ロジック**をユニットテストで固め、リファクタ安全網を張る。→ その後 React Hook / API 統合 / CI へ拡張。

## 2. 原則

1. **テストを先に書く(red → green → refactor)** — バグ修正・リファクタ・新機能すべて同じ流れ。
2. テスト対象は **外部依存を最小化** した純関数から。DOM/Network/AudioContext を直接触るコードはモック境界を設ける。
3. 実環境(録音・再生・D1/R2)の検証はブラウザ/デプロイ後スモークで行い、ユニットテストはロジック検証に集中する。
4. CI(gate)に組み込み、リファクタPRは test + typecheck + lint 通過が必須。

## 3. ツール選定

| 項目 | 選択 | 理由 |
|---|---|---|
| Runner | **vitest** | TS ネイティブ、設定軽量、watch/fail-fast |
| 環境 | `node`(デフォルト) + 必要時 `jsdom` | 純関数は node で十分。DOM 依存は段階追加 |
| React | @testing-library/react(任意・後段) | Hook テスト用 |
| カバレッジ | v8 provider(後段で導入) | — |

設定ファイル: `apps/web/vitest.config.ts`。`@/` alias(tsconfig paths)を vitest でも解決する。

## 4. テスト対象マップ(優先順)

| P | 対象 | 内容 | 依存 | 備考 |
|---|---|---|---|---|
| P0 | `src/lib/audioCodec.ts` | PNG⇔WAV バイト往復(encode→decodeで元データ一致)、`bubbleSizePx` 境界(0/30s/30s超) | なし(canvas はデコード後のみ) | **最重要**。リファクタ対象が一番多い |
| P0 | `src/lib/api.ts` | fetchJSON の URL 結合・エラー、`deviceId` 生成/永続化 | fetch/localStorage モック | — |
| P1 | `src/lib/audioCodec` の無音トリム | 先頭/末尾無音のカット境界、全無音→そのまま | Web Audio(nodeでは `AudioContext` 不在 → モック or テスト用 WAV 解析に切替) | 設計要相談 |
| P1 | Hono API(Functions) | rate limit / バリデーション / delete権限 | D1/R2 モック or miniflare | wrangler 依存。後段で `@cloudflare/vitest-pool-workers` 検討 |
| P2 | Hooks (`useAudioRecorder` / `useAudioPlayer`) | 状態遷移 | mediaDevices / AudioContext モック | — |
| P2 | 統合/スモーク | デプロイ後の API smoke(`/api/healthz` 等) | 実 CF Pages | CI の deploy job 内で |

## 5. ディレクトリ・命名

```
src/lib/__tests__/audioCodec.test.ts
src/lib/__tests__/api.test.ts
```
- テストは `__tests__/` に置き、`.test.ts` 命名。
- テストデータ(実 WAV bytes / PNG)は `src/test/fixtures/` に置き、コミット可能な小サイズのみ(≲10KB)。バイナリ生成は fixture 生成スクリプト(`scripts/gen-fixtures.ts`)で再現可能に。

## 6. CI / agentic workflow (GitHub Actions)

2系統の workflow を想定(PR + master):

1. **CI (test系)** — `test.yml`: vitest run + typecheck(`tsc --noEmit`) + lint。PR 必須 gate。
2. **CI (refactor系)** — リファクタ作業の安全確認: 上記 CI + (任意)変更ファイル限定の差分テスト。最初は1本に統合してよい。

> `npm install` は `docs/deploy.md` §4-2 の peer conflict のため `--legacy-peer-deps` を workflow でも使用(解消されるまで)。未使用 `@cloudflare/next-on-pages` の削除は `docs/issue.md` N4 として管理。

## 7. 実施手順(次のステップ)

1. vitest 導入 (`npm i -D vitest`、config、`test` script)
2. P0: `audioCodec` テストを **先に書き**(現実装を検証する回帰テスト)→ 緑確認
3. P0: `api.ts` テスト
4. CI `test.yml` 追加(ローカルで act/gha 検証)
5. P1 以降は対象ごとに issue 化して進める

## 8. 未決定・要相談

- 無音トリムのテスト方式(node で AudioContext 不在問題の扱い)
- `@cloudflare/vitest-pool-workers`(D1/R2 込みの API テスト)を導入するか
- Hook テスト用の jsdom 導入タイミング
