# ねがいぐも（Vercel運用版・平置き構成）

スマホだけでアップロードできるよう、すべてのファイルをフォルダなしで置いています。

## 公開手順（iPhoneでOK）
1. GitHubで新しいリポジトリを作成（例: negaigumo）
2. Add file → Upload files → この中のファイルを**ぜんぶ選択**してアップロード → Commit
3. vercel.com にGitHubでログイン → Add New → Project → このリポジトリをImport → Deploy（Viteと自動認識）

## 更新のしかた
GitHub上で App.jsx を編集 → Commit するだけ。数十秒で公開版に反映されます。
