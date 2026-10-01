# HiddenShade · 藏影迷城 · 隠影の迷城

Offline isometric stealth escape. AGPL-3.0. No backend or tracking.

## English
Start the game, explore the remembered maze, avoid patrol cones and reach the warm door. WASD/arrows move in screen directions; Space hides/leaves an alcove; Escape/P pauses. Touch: joystick or direction pad, hide button, pinch or +/− zoom. Being caught retries the same floor and routes; escaping saves the next floor. Settings include language, audio, key bindings, JSON and Base64 save transfer with import preview and backup.
Install from your browser’s app menu (iOS: Share → Add to Home Screen). Once the service worker finishes caching the first online visit, you can play offline. Local records retain the most recent 100 escapes; lifetime statistics remain cumulative. Pause stops FM voices; resume restarts the current music score. After an escape, download a 2400×1260 localized progress card.

## 繁體中文
按開始探索迷宮，利用記憶地圖、轉角與藏匿點避開巡邏者，找到暖光出口。WASD／方向鍵依畫面方向移動，空白鍵藏匿／離開，Esc／P 暫停。觸控可用搖桿或方向鍵、互動鈕、雙指或＋／－縮放。被抓重試相同迷宮與路線，逃脫保存下一層。設定提供三語、音量、按鍵、JSON／Base64 存檔匯入匯出；匯入先預覽並自動備份。
可由瀏覽器選單安裝，iOS 使用「分享 → 加入主畫面」。首次連線並完成 Service Worker 快取後即可離線遊玩。保留最近 100 次逃出紀錄，累計統計不截斷。暫停會停止 FM 發聲，恢復時重新播放目前樂曲。逃出後可下載 2400×1260 的當前語言進度圖卡。

## 日本語
開始ボタンから迷路を探索し、記憶地図と隠れ場所を利用して巡回者を避け、暖かい光の出口へ。WASD／矢印で画面方向に移動、Space で隠れる／出る、Esc／P で一時停止。タッチはスティック、方向ボタン、隠れるボタン、ピンチまたは＋／−。捕まると同じ階と経路を再挑戦、脱出すると次の階を保存。設定で言語・音量・キー・JSON／Base64 セーブ転送。読み込み前にプレビューとバックアップを作成。
ブラウザーのアプリメニューからインストールできます。iOS は共有→ホーム画面に追加。初回オンライン訪問で Service Worker のキャッシュが完了した後はオフラインで遊べます。最近100件の脱出記録を保持し、累計統計は残ります。一時停止で FM 音声を停止し、再開時に現在の曲を最初から再生します。脱出後は2400×1260の進捗カードを現在の言語で保存できます。

## Run

Node.js 22+：`npm start` → http://localhost:4173。`npm run check` 執行核心行為驗證。無需安裝 runtime 依賴。HTTPS 或 localhost 可啟用 PWA；首次完整載入並完成快取後可離線。

修改遊戲／資產後、發布前執行 `npm run cache`，重新產生內容雜湊離線清單。`?lang=zh|en|ja` 切換語言，`?renderer=auto|webgpu|webgl2|canvas2d` 選擇 backend。實測證據與裝置限制見 [ACCEPTANCE.md](./ACCEPTANCE.md)。

## Deployment

GitHub Pages workflow 在 push 到 main 後驗證遊戲並產生離線資產清單，再發布網站。倉庫的 Pages source 需選 GitHub Actions；自訂網域為 `hiddenshade.ysgs.app`，DNS 指向 `yueyuhoshizora.github.io`。遊戲尚未 push／部署；僅先前依使用者要求推送 CNAME。正式網域、HTTPS 與實體手機安裝未驗證。

## Source / licenses

https://github.com/YuStellarGamesStudio/HiddenShade

XYZ.js v1.6: Apache-2.0 (`vendor/xyz/LICENSE`). OPM.js: Apache-2.0 (`vendor/xyz/dist/vendor/opm/LICENSE`). 引擎 release SHA-256：`7ef17cdf386a9fa6a2d150c8aaf80051301763def211b0ae2daf068d4b9cc0b5`。
