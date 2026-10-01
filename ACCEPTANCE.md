# HiddenShade 驗收

驗證日期：2026-10-01。實作已完成；以下區分實際測得的結果與尚未驗證的實體裝置／部署事項。

## 執行環境

- macOS arm64、Node.js 26.7.0、managed headless Chromium。
- `npm run check`：PASS，24 組種子樓層，迷宮護欄、路徑實際移動到出口、碰撞、同種子重試、藏匿／現身、記憶、AI 狀態轉移、遮擋、評價邊界及 destroy。
- `npm run cache`：193 個離線資產，最終版本 `50c0be77c6965496`。

## 硬指標與功能

| 項目 | 實測結果 |
| --- | --- |
| 種子與迷宮護欄 | 核心檢查通過；20→40 格上限、藏匿密度／15 格覆蓋／起點 8 格藏匿、出口直徑比、連通與巡邏覆蓋皆由生成器驗證，不合格重生成。 |
| 逃出與存檔 | 真實瀏覽器連續走過第 1、2、3 層出口；計時約 23.37、38.83、27.05 秒，三次 3 星、存檔到第 4 層。此路徑 smoke 使用 BFS 提供移動輸入並移除敵人以隔離出口流程，不代表真人首次遊玩的時間或難度。 |
| 被抓與重來 | 真實警戒／追捕／被抓，結果畫面顯示巡邏者與目擊座標；Retry 保留同樓層、種子、格網與巡邏路線。 |
| 藏匿與現身 | 合法藏匿點＋實際互動按鈕：hidden=true；第二次操作出現 0.5 秒現身階段，HUD 顯示「現身中…」，角色有半透明現身狀態。核心 smoke 覆蓋目擊藏匿的搜尋／逃脫窗口。 |
| 視線與記憶 | 四個 renderer 選項均測試合法鄰近巡邏者可見、牆後巡邏者不可見；移動後已探索記憶保留；相同輸入的初始可見格資料完全一致。GPU 遮罩與 Canvas2D 畫面均截圖檢視。 |
| 暫停 | 實際 Pause：計時／敵人狀態不變，input vector 歸零，音訊 master=0、playbacks=0、量測 RMS=0；Resume 可恢復遊玩。 |
| 三語 | 125 個 catalog key 三語對齊，23 個特殊按鍵標籤存在；實際 en/zh/ja 原地切换，網址、html lang、document title 正確，沒有頁面重載。 |
| 存檔雙軌 | 實際 JSON 按鈕下載 748-byte fixture，重新以 file input 上傳、預覽、確認後完整還原；Base64 同樣往返還原。預覽／取消不改寫存檔，確認前備份原槽。 |
| 遷移／錯誤／備援 | v0 floor 4 遷移後最高到達層為 4；未來版本、損毀與不合規資料拒絕。損毀主槽重開後還原備援；quota failure 時仍保留備援的第 7 層／紀錄／自訂按鍵並顯示警告，儲存恢復後可修復。 |
| 存檔節流／pagehide | 15 次快速設定事件只寫入兩次，間隔約 1006 ms；reload/pagehide 強制保存最新值。最近樓層紀錄最多 100 筆，統計仍累計。 |
| 美術重製 | 所有地形、角色、標記、標題圖、OG 圖、分享圖與圖示重繪為 3× 分層 SVG；auto／WebGPU／WebGL2／Canvas2D 四種 renderer 實際遊玩畫面一致、console 無錯誤；分享卡實際輸出 2400×1260（日文）。僅在 Chromium 以截圖目視檢查，未做跨瀏覽器或實體裝置比對。 |
| auto／WebGPU／WebGL2／Canvas2D | 實際啟動、移動計時與音訊 unlock；auto 選中 WebGPU，明確 backend 三種皆可遊玩、無 console error。 |
| 離線 | 關閉 Chromium 網路後，在未訪問過的 lang/renderer/query 網址重新載入，Canvas2D 啟動、141 筆 vendor 資源載入、OPM unlock；native ArrowRight 將玩家 (3,3) 移到 (3.2545,2.7455)，status=playing、navigator.onLine=false。 |
| 快取更新 | 真實舊 SW/cache `953b753fa94f32e8` → `50c0be77c6965496`；新版本完成整包快取後啟用，舊 cache 刪除，升級前後 localStorage 存檔字串完全相同；沒有使用 ignoreSearch。 |
| RWD | 1440×900、900×768、375×667、390×844、667×375；35 個畫面矩陣涵蓋 title/playing/paused/settings/import/caught/escaped，另驗證窄版設定分頁。矩陣部分以 live UI＋結果 fixture 驗證布局，不等同 35 次遊戲過關。 |
| 觸控與鍵盤 | 實際 WASD／Escape／重綁 L、dpad、搖桿拖曳、+/−；native CDP 雙觸點 pinch 使 zoom 1.22→1.3325。可見非 inert 觸控目標 ≥44 px；html/body 與面板無捲軸；含五筆紀錄的寬／中布局不再裁切底部摘要。native 右鍵觸發 contextmenu 後 defaultPrevented=true。 |
| 分享圖 | 實際下載 PNG 2400×1260，圖卡只保留插畫背景與當前語言的最高到達層／累計 MM:SS／最佳星數；固定英文 OG 圖為 1200×630。 |
| OPM FM | 實際 AnalyserNode tap：ambient peak RMS 約 .2022、chase 約 .1296，chase voice=Pursuit；Pause 後零輸出。音量／開關及追捕音效路徑實測；沒有錄音檔資產。 |
| 20 次場景切換 | 實際 playing→paused→title→playing 循環 20 次：舊場景 destroyed=true、entities=0、objects=0；第 4 層每次 live entities/objects 維持 1183。 |
| 效能與最終釋放 | 第 100 層、40×40、8 名巡邏者，玩家藏匿於中央附近、全部地形記憶揭開：297 個可見 Sprite，120 幀量測約 60.00 fps、median 16.7 ms。最終 game.destroy 後 entities/objects/textures/playbacks/asset cache 均為 0，AudioContext=closed。此為固定場景實測，不保證所有裝置／移動場景。 |
| Console | 最終 gameplay/backend/offline/lifecycle smoke 無 console error、無 page error；非法匯入與故意儲存失敗另有預期 warning。 |
| 授權／交付 | AGPL-3.0 全文、XYZ.js v1.6／OPM.js Apache-2.0 與 provenance/NOTICE 已收錄；根 favicon、六件文件、SVG 原圖與圖集俱全。 |

## 尚未驗證／未執行

- 沒有實體手機飛機模式、iOS 加入主畫面或原生安裝測試；離線證據是 Chromium 網路停用。
- FM 有數位輸出量測，未由人耳試聽；沒有真人 3–5 分鐘節奏／首次被抓時機的 playtest。
- 沒有 Safari／Firefox／不同手機 GPU 實測，也未做長時間 heap profiling；上述資源釋放證據不等同所有可能洩漏的形式化證明。
- GitHub Pages workflow、CNAME、OG 網址已備妥；遊戲程式碼尚未 push、未部署，DNS／HTTPS／正式網域未驗收。先前僅依使用者追加要求推送 CNAME commit。
