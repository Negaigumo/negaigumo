# ねがいぐも ☁️🐬

痛みの奥にかくれている「ほんとうの願い」を、天使イルカのミリィと見つける感情ウェルネスアプリ。

つぶやき → 痛み（STEP1） → こんな自分でいたかった（STEP2） → 本当に欲しかった気持ち（STEP3） → 願いとして保存。
願いが10個そろうと「5次元オーダー」がひらき、手放した願いから「ねがいの国」に島が生まれます。

## 構成

```
negaigumo/
├── index.html          … 起動画面（フォント・ローディング演出）
├── src/
│   ├── main.jsx        … エントリーポイント
│   └── App.jsx         … アプリ本体（画面・演出・AI連携ぜんぶここ）
├── public/milly/       … ミリィの画像（差し替えたい時はここ）
│   ├── milly_std.webp      … スタンダード表情
│   ├── milly_wink.webp     … ウインク（願いが見つかった時）
│   ├── milly_sparkle.webp  … 目がキラキラ（5次元オーダー専用）
│   └── m_*.webp            … 羽ばたきパペット用のパーツ（羽・体・輪っか）
├── package.json
└── vite.config.js
```

## 公開のしかた（GitHub + Vercel）

1. GitHubでリポジトリを作成し、このフォルダの中身をすべてアップロード
2. [vercel.com](https://vercel.com) にGitHubでログイン → **Add New → Project** → このリポジトリをImport
3. Framework は **Vite** と自動認識されるので、そのまま **Deploy**
4. 1〜2分でURLが発行されます

## 更新のしかた

GitHub上でファイルを編集（スマホでもOK）→ **Commit changes** を押すだけ。
Vercelが自動でビルドして、数十秒で公開版に反映されます。

- 文言やロジックの変更 → `src/App.jsx`
- ミリィの画像差し替え → `public/milly/` の同名ファイルを置き換え
- 起動画面 → `index.html`

## 使い方メモ

- **Groq APIキー**（`gsk_` から始まる無料キー）を入れるとAIモード、キーなしでも内蔵候補で遊べます
- **テストモード**: URLに `?demo=1` を付ける、または画面最下部の文字を5回タップ → 願い事リストにサンプル10個うめボタンが出ます

## ローカル開発（任意）

```bash
npm install
npm run dev
```
