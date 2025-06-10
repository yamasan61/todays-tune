# Spotify PKCE Demo (Front-end only)

## 構成
- **index.html**: 「Spotifyでログイン」ボタン。PKCE を生成して authorize エンドポイントへリダイレクトします。
- **pkce.js**: code_verifier / code_challenge を生成するユーティリティ。
- **callback.html**: 認可コードを受け取り、/api/token でアクセストークンを取得して画面表示します。

## 使い方
1. `index.html` を GitHub Pages など HTTPS で公開。
2. Spotify Developer Dashboard で下記の Redirect URI を登録してください  
   `https://yamasan61.github.io/spotify-token-test/playlist_recommender/index.html`
3. ブラウザで `index.html` を開き、「Spotify でログイン」をクリック。
4. Spotify 認可画面 → 同意すると `callback.html` に戻り、トークンが表示されます。

### メモ
- クライアントシークレットは不要（PKCE のため）。
- アプリは公開クライアントとして機能しますが、token エンドポイントが CORS を許可しているのでフロントだけで完結します。
