// app.js
(async () => {
  'use strict';

  /**
   * DOM
   */
  const genreSelect = document.getElementById('genreSelect');
  const tokenInput  = document.getElementById('tokenInput');
  const tracksElm   = document.getElementById('tracks');
  const form        = document.getElementById('playlistForm');

  /**
   * ランダム柔らか色を生成 (カード背景に使用)
   */
  const softColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = 60 + Math.random() * 20;  // 60–80%
    const l = 75 + Math.random() * 10;  // 75–85%
    return `hsl(${h},${s}%,${l}%)`;
  };

  // --- ジャンル一覧を JSON からロード ---
  try {
    const res = await fetch('genres.json');
    if (!res.ok) throw new Error(`genres.json の取得に失敗 (${res.status})`);
    const data = await res.json();
    const { genres } = data;
    if (!Array.isArray(genres)) throw new Error('genres.json の形式が不正です');

    // select 要素へ追加
    genres.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.value;
      opt.textContent = g.label;
      genreSelect.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    genreSelect.innerHTML = '<option>ジャンル読込失敗</option>';
    genreSelect.disabled = true;
  }

  /**
   * フォーム送信 → Spotify 検索
   */
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    tracksElm.innerHTML = ''; // クリア

    const genre = genreSelect.value;
    const token = tokenInput.value.trim();

    if (!token) {
      alert('アクセストークンを入力してください。');
      return;
    }

    const endpoint = `https://api.spotify.com/v1/search?q=genre%3A${encodeURIComponent(genre)}&type=track&limit=10&market=JP`;

    try {
      const res = await fetch(endpoint, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      // トークン切れ・レート制限など
      if (res.status === 401) throw new Error('トークンが無効または期限切れです');
      if (res.status === 429) throw new Error('API の呼び出し制限に達しました。しばらく待って再試行してください');

      if (!res.ok) throw new Error(`Spotify API エラー (${res.status})`);

      const json = await res.json();
      const tracks = json.tracks?.items;
      if (!Array.isArray(tracks) || !tracks.length) {
        throw new Error('該当曲が見つかりませんでした');
      }

      // --- 表示 ---
      tracks.forEach(track => {
        const card = document.createElement('article');
        card.className = 'track-card';
        card.style.setProperty('--bg-color', softColor());

        const img = document.createElement('img');
        img.src = track.album.images[0]?.url || '';
        img.alt = track.name;

        const title = document.createElement('p');
        title.className = 'title';
        title.textContent = track.name;

        const artist = document.createElement('p');
        artist.className = 'artist';
        artist.textContent = track.artists.map(a => a.name).join(', ');

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(artist);

        // 30 秒プレビュー
        if (track.preview_url) {
          const playBtn = document.createElement('button');
          playBtn.className = 'play-btn';
          playBtn.textContent = '▶︎ 試聴';
          let audio = null;

          playBtn.addEventListener('click', () => {
            if (!audio) {
              audio = new Audio(track.preview_url);
              audio.play();
              playBtn.textContent = '⏸ 一時停止';
            } else if (audio.paused) {
              audio.play();
              playBtn.textContent = '⏸ 一時停止';
            } else {
              audio.pause();
              playBtn.textContent = '▶︎ 試聴';
            }

            // 再生終了でボタンを戻す
            if (audio) {
              audio.addEventListener('ended', () => {
                playBtn.textContent = '▶︎ 試聴';
              }, { once: true });
            }
          });
          card.appendChild(playBtn);
        }

        tracksElm.appendChild(card);
      });

    } catch (err) {
      console.error(err);
      tracksElm.innerHTML = `<p style="color:#c00;font-weight:bold;">${err.message}</p>`;
    }
  });
})();
