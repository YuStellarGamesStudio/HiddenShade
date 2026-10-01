# XYZ.js

Browser-native TypeScript game engine. Package metadata is **1.6.0**; **P01–P08, the supported P09–P12 profile and P13–P20 are accepted as recorded in ACCEPTANCE.md**, limited to the measured Chromium environment. Current integration passes build/typecheck/lint/format and **49 files/340 tests**. The package is not published on npm. The root package is licensed under **Apache-2.0** (see [LICENSE](LICENSE)); release assets up to v1.5 still carry `UNLICENSED` metadata, while v1.5.1 and later carry Apache-2.0.

GitHub **v1.6** ships `xyz.js-1.6.0.tgz` and `SHA256SUMS` (earlier tags v1.0–v1.5.2 remain; v1.6 adds the examples gallery and 11 feature-focused examples, with no engine source change). The 1.5 additions are listed per language below and recorded in [ACCEPTANCE](ACCEPTANCE.md); the P21–P29 2D profile is included since v1.3. v1.5.1 added the Apache-2.0 license and a 10 s WebGL2 context-restore timeout; v1.5.2 is a clean re-release of it whose source tree no longer contains the removed `examples/firstperson`.

文件導覽／Documentation／資料：[計畫與範圍](PLAN.md) · [驗收與 commits](ACCEPTANCE.md) · [設計](DESIGN.md) · 使用說明 [English](docs/USAGE.md)／[繁體中文](docs/USAGE-zh.md) · 技術參考 [English](docs/TECHNICAL.md)／[繁體中文](docs/TECHNICAL-zh.md) · [執行指引](AGENTS.md) · [工作約定](CLAUDE.md)。

## 繁體中文

### 目前可用

引擎提供 Game／Scene／ECS、2D／3D Math、Texture／Sprite、Camera／Input 與 Mesh 深度／光照管線。`auto` 依 WebGPU→WebGL2→Canvas2D 初始化降級；強制 backend 失敗不切換。以 `game.graphics.capabilities.threeD` 判斷 3D 支援，Canvas2D 只有 2D。WebGPU 需要安全來源（localhost 可用）。Audio 使用官方 OPM.js；在使用者手勢中呼叫 `await game.audio.unlock()`。

新增 3D：Object3D／Group 階層、透視／正交相機與 lookAt、OrbitControls、精確 Raycaster、glTF 2.0／GLB、關鍵幀與 CPU 骨骼動畫、PBR／點光源／聚光燈、方向光 PCF 陰影、InstancedMesh，以及 3D HDR exposure／ACES／bloom（2D overlay 不受影響）。API 參考 three.js，但不是 drop-in replacement，也不承諾全部 addons；沒有新增 runtime dependency。詳細支援與限制見雙語技術參考。

P13 新增既有 GameObject 的 2D 階層／Group2D、atlas Sprite source／SpriteSheet、FrameAnimation、SpriteFont／SpriteText、NineSlice 與 ScreenElement HUD，已驗三 backend 正式路徑。Sprite width／height 是自然 source 尺寸，縮放用 scale；Sprite.source 可為 fractional pixels，SpriteSheet frames 為 integer。`/examples/gameplay2d/` 展示動畫／字形／面板／HUD。

P18 已完成限定 Chromium 驗收：PreloadBatch task-count progress、Scene.preload→initialize barrier／Game.loading、bounded text／JSON／binary、unique GLTFLoader.task 與 native PCM/WAV sample alongside OPM。Unlock 前只 fetch，decode／play 要手勢 unlock，重用第一個 OPM context（共八個，不建第九個）；Game pause 不自動暫停音訊。沒有跨瀏覽器／新效能或聽見喇叭聲聲明。

P14 已驗收 target-only lifecycle／pointer／drag、Actions／Easings 與 CameraStrategies。P15–P17 三backend已驗discrete linear／angular circle／box／convex physics／Trigger2D、TileMap／IsometricMap solids／elevation／culling與seeded CPU ParticleEmitter local／world pools；pause凍結、teardown保留borrowed Texture。無CCD／joints／concave physics／GPU particles／editor importer。P20 GPU／GL native Material2D／ordered PostProcessor2D只處理transparent 2D world＋HUD，不改3D／HDR；先await prepareMaterial／preparePostProcessor，Canvas2D明確UnsupportedGraphicsError。Prepared entries跨resize／disable保留至descriptor destroy，mutable targets釋放，owned captures保留／scale。P19真Game三backend已驗handoff／pause／resize／Promise completion與final easing endpoint；正式P13–P20 playground與完整工具鏈37檔／252tests已通過，詳見雙語guides。

P21–P29 已批准有限 PixiJS-inspired profiles 已整合為 source 並在單一環境（macOS arm64 managed headless Chromium，含 WebGPU adapter）實測：三 backend 共用 2D command stream、affine／atlas／raster paths／offscreen isolation／masks／blends／native filters-mesh／text-assets／opt-in interaction-accessibility／particles-preparation，正式範例 [examples/rendering2d](examples/rendering2d/index.html) 於三 backend 執行；Canvas native filters／visible mesh 明確拒絕。這**不是** full Pixi parity、跨瀏覽器／真實硬體／效能證明，也未納入 GitHub v1.2；驗證範圍與未驗項見 [ACCEPTANCE](ACCEPTANCE.md)，profiles 見 [PLAN](PLAN.md)。

```html
<canvas id="game"></canvas>
```

在已安裝本機 tarball 或可解析 `xyz.js` 的 npm/bundler 專案中（尚未 npm publish）：

```ts
import { Game } from 'xyz.js';

const game = await Game.create({ canvas: '#game', renderer: 'webgpu' });
game.addEventListener('error', (event) =>
  console.error((event as CustomEvent<Error>).detail),
);
game.start();

// 如需控制：game.pause(); game.resume(); game.resize(1280, 720); game.destroy();
// game.clock.deltaTime、elapsedTime（秒）、frame、fps
```

`Game.create` 預設 `renderer:'auto'`；上例刻意指定 WebGPU 顯示 triangle。其他設定：`width`／`height`（1280×720 CSS 像素）、`maxDeltaTime`（0.1 秒）、`pixelRatio`（裝置比例上限 2）、`autoResize`（true）。size containment 不覆寫作者 width／height CSS；可在有尺寸的容器使用 `width:100%;height:100%`，或 width 加明確 `aspect-ratio`。`resize()` 更新 intrinsic fallback，autoResize 仍以 content box 為準；`fps` 使用未 clamp 幀間隔。每個 Canvas 限一個 Game（含初始化）；一般 pause 可 resume。初始化失敗會 reject；fatal frame／graphics 錯誤送出 `error` 並暫停，需 destroy／重新 create。Scene 準備與 Audio 排程錯誤也可能送出 `error`，但不一定是 fatal。狀態為 idle／running／paused／destroyed。

工具鏈要求 Node >=26、pnpm 12.6.0。執行 `npx pnpm@12.6.0 install`、`npx pnpm@12.6.0 dev`，開啟 `http://127.0.0.1:5173/examples/triangle/`；完整檢查是同一 pnpm 版本的 `build`、`typecheck`、`test`、`lint`、`format:check`。P08 的 2026-09-30 紀錄為五項通過、16 檔／73 測試通過，詳見 [驗收紀錄](ACCEPTANCE.md)。build 輸出 JS、`.d.ts` 與官方 vendor；無 bundler 時完整複製 `dist/`（含 `dist/vendor/opm/`），再從 `/vendor/xyz/dist/src/index.js` 等部署 URL import。根套件維持 UNLICENSED，不因 OPM 的 Apache-2.0 授權而自動改變。

Build 自動最小化 `dist/` 的引擎 JavaScript，保留 ESM 目錄、公開名稱、宣告與 source maps；官方已最小化的 OPM vendor 原樣複製。實測 36 個引擎 JS 約減少 48% 體積；最新安全修正與發佈驗證為 17 檔／82 測試通過。

v1.4／v1.5 新增（皆 additive，無新 runtime dependency）：空間音效（`sample.play(..., { spatial })`、`audio.listener`）、標準 mapping Gamepad、glTF morph targets、`EnvironmentMap`（IBL＋skybox）、視錐剔除、glTF 常用 extension（emissive strength／unlit 近似／texture transform／lights_punctual）、`scene.fog`、WebGPU 4× MSAA（`antialias`，預設 true）、半透明排序、`scene.effects3D`、`FirstPersonControls`（Pointer Lock）、`graphics.stats`，以及 WebGL2 context／WebGPU device 遺失復原（`recoverGraphics`，預設 true；遺失後 RenderTexture2D／snapshot 需重建）。WebGPU 真實 device loss、Pointer Lock 實機、實體手把與空間音效聽感尚未驗證；glTF `COLOR_0` 頂點色仍被拒絕，Draco／KTX2 因需外部 decoder 不支援。

可執行範例：`triangle`、`sprite`、`pong`、`cube3d`、`fallback-demo`、`showcase`（2D＋3D＋音訊同場）、`advanced3d`（進階 3D，含 Environment 與 fog）、`gameplay2d`、`rendering2d`。驗收證據見 `ACCEPTANCE.md`；本倉庫不自動 push／publish。

已驗證 managed Chromium 150；Safari／Edge／Firefox、實體 gamepad、真實背景分頁／BFCache 矩陣、跨螢幕 DPR 與 driver reset 尚未認證。WebGPU／AudioWorklet 需要安全來源；benchmark 的約 60fps 不是跨裝置保證。

## English

### Available now

Game/Scene/ECS, 2D/3D math, Texture/Sprite, camera/input and lit, depth-tested Mesh rendering are available. `auto` tries WebGPU→WebGL2→Canvas2D including initialization failures; forced backends never fall back. Check `game.graphics.capabilities.threeD`: Canvas2D is 2D-only. WebGPU requires a secure origin. Audio uses official OPM.js; call `await game.audio.unlock()` from a user gesture.

Advanced 3D includes Object3D/Group hierarchies, perspective/orthographic cameras and lookAt, OrbitControls, exact Raycaster picking, glTF 2.0/GLB, keyframe and CPU skeletal animation, PBR/point/spot lights, directional PCF shadows, InstancedMesh, and HDR exposure/ACES/bloom before the unaffected 2D overlay. The API is three.js-inspired, not a drop-in replacement or all-addon implementation; no runtime dependency was added. See the bilingual technical references for support boundaries.

P13 adds 2D hierarchy/Group2D, atlas Sprite source/SpriteSheet, FrameAnimation, SpriteFont/SpriteText, NineSlice and ScreenElement HUD to existing GameObject, exercised on all three backends. Sprite width/height are natural source dimensions; use scale. Sprite.source permits fractional pixels; SpriteSheet frames require integer pixels. Open `/examples/gameplay2d/` for animation, glyphs, panels and HUD.

P18 is accepted in the recorded Chromium scope: task-count PreloadBatch, Scene.preload→initialize barrier/Game.loading, bounded text/JSON/binary, uniquely owned GLTFLoader.task, native PCM/WAV samples alongside OPM. Preunlock fetch does not decode; gesture unlock is required for decode/play, reusing the first OPM context (eight total, no ninth). Game pause does not pause audio. No new cross-browser/performance or speaker-audibility claim.

P14 accepts target-only lifecycle/pointer/drag, Actions/Easings and CameraStrategies. P15–P17 are proven on all three backends: discrete linear/angular circle/box/convex physics/Trigger2D, TileMap/IsometricMap solids/elevation/culling, seeded CPU ParticleEmitter local/world pools, pause and borrowed-texture teardown. No CCD/joints/concave physics/GPU particles/editor importer. P20 GPU/GL native Material2D/ordered PostProcessor2D process transparent 2D world+HUD only, leaving 3D/HDR unchanged; await prepareMaterial/preparePostProcessor, with explicit Canvas2D UnsupportedGraphicsError. Prepared entries survive resize/disable until descriptor destruction, mutable targets release, owned captures survive/scale. P19 actual three-backend Game handoff/pause/resize/Promise completion/final easing endpoint, the formal P13–P20 playground and final toolchain37files/252tests are accepted. See the bilingual guides.

P21–P29 are approved bounded PixiJS-inspired profiles, now integrated and exercised in one environment only (macOS arm64 managed headless Chromium with a WebGPU adapter): one shared 2D command stream across all three backends for affine utilities, atlases, raster paths, offscreen isolation, masks, blends, native filters/meshes, text/assets, opt-in interaction/accessibility and particles/preparation. The formal [examples/rendering2d](examples/rendering2d/index.html) example runs on all three; Canvas explicitly rejects native filters and visible meshes. This is neither full Pixi parity nor cross-browser, real-hardware or performance evidence, and it is not part of GitHub v1.2. See [ACCEPTANCE](ACCEPTANCE.md) for verified scope and unverified items, and [PLAN](PLAN.md) for the profiles.

```ts
import { Game } from 'xyz.js';

const game = await Game.create({ canvas: '#game', renderer: 'webgpu' });
game.addEventListener('error', (event) =>
  console.error((event as CustomEvent<Error>).detail),
);
game.start();
```

Add `<canvas id="game"></canvas>`. The default renderer is `auto`; the example explicitly requests WebGPU for the triangle. Other defaults are `width`/`height` (1280×720 CSS pixels), `maxDeltaTime` (0.1s), `pixelRatio` (device ratio capped at 2), and `autoResize` (true). Size containment preserves authored CSS; use a sized container or width plus explicit `aspect-ratio`. `resize()` updates intrinsic defaults; autoResize follows the content box. Clock fps uses the unclamped interval. Each canvas permits one Game, including initialization. Normal pause is resumable. Initialization failures reject; fatal frame/graphics errors emit `error` with `detail`, pause the Game and require destroy/recreate. Scene preparation and audio scheduling errors may also emit `error` without being fatal.

Use Node >=26 and pnpm 12.6.0: `npx pnpm@12.6.0 install`, then `npx pnpm@12.6.0 dev` and open `http://127.0.0.1:5173/examples/triangle/`. Run `build`, `typecheck`, `test`, `lint`, and `format:check` with the same pnpm version. The recorded P08 run on 2026-09-30 passed all five, with 16 files / 73 tests; see [ACCEPTANCE.md](ACCEPTANCE.md). The package is not published on npm; bare imports work after installing a local tarball or configuring a resolver. For unbundled use, copy the **entire** built `dist/` tree, including `dist/vendor/opm/`, and import a deployed URL such as `/vendor/xyz/dist/src/index.js`. The root package remains UNLICENSED; OPM's Apache-2.0 license applies to the vendor, not the engine.

Build automatically minifies engine JavaScript in `dist/`, preserving the ESM tree, public names, declarations, and source maps. The already-minified official OPM vendor is copied unchanged. The measured reduction across 36 engine JS files is about 48%; the latest security and distribution verification passed 17 files / 82 tests.

Added in v1.4/v1.5 (all additive, no new runtime dependency): spatial sample audio (`sample.play(..., { spatial })`, `audio.listener`), standard-mapping Gamepad, glTF morph targets, `EnvironmentMap` (IBL + skybox), frustum culling, common glTF extensions (emissive strength, approximate unlit, texture transform, lights_punctual), `scene.fog`, WebGPU 4× MSAA (`antialias`, default true), blended-mesh sorting, `scene.effects3D`, `FirstPersonControls` (Pointer Lock), `graphics.stats`, and WebGL2 context / WebGPU device-loss recovery (`recoverGraphics`, default true; RenderTexture2D and snapshots must be recreated after a loss). Real WebGPU device loss, Pointer Lock on hardware, physical gamepads and spatial-audio listening are unverified; glTF `COLOR_0` vertex colors are still rejected and Draco/KTX2 are unsupported because they need external decoders.

Runnable examples: `triangle`, `sprite`, `pong`, `cube3d`, `fallback-demo`, `showcase` (2D + 3D + audio), `advanced3d` (with Environment and fog), `gameplay2d` and `rendering2d`. See `ACCEPTANCE.md` for evidence and limitations. This repository does not push or publish automatically.

Verified in managed Chromium 150. Safari/Edge/Firefox, physical gamepads, real background-tab/BFCache matrices, cross-monitor DPR and driver resets are not certified. WebGPU/AudioWorklet require a secure origin. The ~60 fps benchmark result is not a cross-device guarantee.

## 日本語

### 現在利用可能

Game／Scene／ECS、2D／3D 数学、Texture／Sprite、Camera／Input、深度と照明付き Mesh を提供します。`auto` は初期化失敗時も WebGPU→WebGL2→Canvas2D の順に降格します。強制 backend は切り替えません。`game.graphics.capabilities.threeD` で判定し、Canvas2D は 2D 専用です。WebGPU はセキュアなオリジンが必要です。音声は公式 OPM.js を使用し、ユーザー操作から `await game.audio.unlock()` を呼び出します。

高度な 3D として Object3D／Group 階層、透視／正投影カメラと lookAt、OrbitControls、正確な Raycaster、glTF 2.0／GLB、キーフレームと CPU スキニング、PBR／点光源／スポットライト、方向光 PCF シャドウ、InstancedMesh、2D overlay より前の HDR exposure／ACES／bloom を提供します。three.js を参考にした API ですが互換置換や全 addons 対応ではなく、runtime dependency は追加していません。制限は技術参照をご覧ください。

P13 は既存 GameObject の2D階層／Group2D、atlas source／SpriteSheet、FrameAnimation、SpriteFont／SpriteText、NineSlice、ScreenElement HUD を三backendで検証済みです。Sprite width／height は自然サイズ、表示サイズはscale、sourceは小数pixel可、SpriteSheet framesは整数のみ。`/examples/gameplay2d/` で確認できます。

P18 は限定Chromium環境で検証済みです：PreloadBatch progress、Scene.preload→initialize／Game.loading、有界readers、unique GLTFLoader.task、OPMと併用するPCM/WAV sample。Unlock前はfetchのみ、decode／playはユーザー操作unlockが必要、最初のOPM contextを再利用（合計八個、九個目なし）。Game pauseは音声を停止しません。他browser／新性能／スピーカーで聞こえたとの主張はありません。

P14 target-only lifecycle／pointer／drag、Actions／Easings／CameraStrategiesは検証済みです。P15–P17は三backendでdiscrete linear／angular circle／box／convex physics／Trigger2D、TileMap／IsometricMap solids／elevation／culling、seeded CPU ParticleEmitter local／world pools、pause／borrowed Texture teardownを確認しました。CCD／joints／concave physics／GPU particles／editor importerは非対応。P20 GPU／GL native Material2D／ordered PostProcessor2Dはtransparent 2D world＋HUDのみで3D／HDRは不変、prepareをawaitしCanvas2DはUnsupportedGraphicsErrorです。Prepared entriesはresize／disableで保持、mutable targetsは解放、owned capturesは保持／scaleします。P19 real Game三backend handoff／pause／resize／Promise completion／final easing endpoint、正式P13–P20 playground、最終toolchain37files／252testsは検証済みです。双語guides参照。

P21–P29 の限定 PixiJS-inspired profiles は統合済みで、単一環境（macOS arm64 の managed headless Chromium、WebGPU adapter あり）でのみ実行確認しました。三 backend が共通の 2D command stream を使い、正式サンプル [examples/rendering2d](examples/rendering2d/index.html) も三 backend で動作します。Canvas の native filters／visible meshes は明示的に拒否します。完全な Pixi 互換、クロスブラウザ／実ハードウェア／性能の証明ではなく、GitHub v1.2 にも含まれません。検証範囲と未検証項目は [ACCEPTANCE](ACCEPTANCE.md)、profile は [PLAN](PLAN.md) を参照してください。

```ts
import { Game } from 'xyz.js';

const game = await Game.create({ canvas: '#game', renderer: 'webgpu' });
game.addEventListener('error', (event) =>
  console.error((event as CustomEvent<Error>).detail),
);
game.start();
```

ページに `<canvas id="game"></canvas>` を用意します。既定 renderer は `auto` で、上の例は triangle 用に WebGPU を指定しています。他の既定値は width／height＝1280×720 CSS ピクセル、maxDeltaTime＝0.1 秒、pixelRatio＝デバイス比の上限 2、autoResize＝true です。size containment は利用者の CSS を維持し、resize は intrinsic fallback、autoResize は content box に従います。fps は clamp 前の実フレーム間隔を使います。Canvas は初期化中も一つの Game 専用です。通常の pause は resume できます。初期化失敗は reject、fatal frame／graphics 障害は error イベントと停止で通知し、destroy／再 create が必要です。Scene 準備や音声の error は必ずしも fatal ではありません。

Node >=26 と pnpm 12.6.0 を使用します。`npx pnpm@12.6.0 install`、`npx pnpm@12.6.0 dev` を実行し、`http://127.0.0.1:5173/examples/triangle/` を開きます。同じ pnpm で build／typecheck／test／lint／format:check を実行します。2026-09-30 の P08 記録では全項目と 16 ファイル／73 テストが通過しています（[検証記録](ACCEPTANCE.md)）。npm 未公開のため、bare import はローカル tarball のインストール等で解決してください。bundler を使わない場合は `dist/vendor/opm/` を含む `dist/` **全体**を配置し、`/vendor/xyz/dist/src/index.js` のような URL から import します。エンジン本体は UNLICENSED で、OPM の Apache-2.0 ライセンスとは別です。

Build は `dist/` のエンジン JavaScript を自動的に最小化し、ESM 構造、公開名、型宣言、source maps を保持します。最小化済みの公式 OPM vendor は変更せずコピーします。エンジン JS 36 ファイルのサイズは約 48% 減少し、最新の安全性修正と配布検証では 17 ファイル／82 テストが通過しました。

v1.4／v1.5 の追加（すべて additive、runtime dependency の追加なし）：空間サンプル音声（`sample.play(..., { spatial })`、`audio.listener`）、標準 mapping の Gamepad、glTF morph targets、`EnvironmentMap`（IBL＋skybox）、視錐台カリング、glTF の主要 extension（emissive strength／unlit 近似／texture transform／lights_punctual）、`scene.fog`、WebGPU 4× MSAA（`antialias`、既定 true）、半透明ソート、`scene.effects3D`、`FirstPersonControls`（Pointer Lock）、`graphics.stats`、WebGL2 context／WebGPU device の消失復旧（`recoverGraphics`、既定 true。消失後は RenderTexture2D／snapshot を作り直す）。実際の WebGPU device loss、Pointer Lock 実機、実機 gamepad、空間音声の聴感は未検証です。glTF `COLOR_0` 頂点カラーは引き続き拒否され、Draco／KTX2 は外部 decoder が必要なため非対応です。

実行可能なサンプル：`triangle`、`sprite`、`pong`、`cube3d`、`fallback-demo`、`showcase`（2D＋3D＋音声）、`advanced3d`（Environment と fog を含む）、`gameplay2d`、`rendering2d`。検証結果と制限は `ACCEPTANCE.md` を参照してください。このリポジトリは自動で push／publish しません。

managed Chromium 150 で検証済みです。Safari／Edge／Firefox、実機 gamepad、実際の背景タブ／BFCache 往復、モニター間 DPR と driver reset は未認証です。WebGPU／AudioWorklet にはセキュアなオリジンが必要です。約 60fps の測定値は全環境での保証ではありません。

## Examples／範例／サンプル

Run `npx pnpm@12.6.0 examples` (dev server plus browser at the gallery `http://127.0.0.1:5173/examples/`), or `dev` and open a `/examples/<name>/` URL yourself. The gallery lists every example with feature filters and per-backend links. Links below open the source directories. The examples added after 1.5.2 (physics2d through gltf3d) were each opened on the backends they support in the managed headless Chromium of the session that added them, with console errors checked; `audio-lab` and gamepad paths were verified by state readouts only (no speaker audibility, no physical gamepad), and no cross-browser claim is made.

| Example                                  | 驗證內容／Purpose                                                                                                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [triangle](examples/triangle/)           | WebGPU triangle；Pause／Resume／Destroy                                                                                                                         |
| [sprite](examples/sprite/)               | Shared Texture、z-order／opacity、六聲部 BGM＋SFX                                                                                                               |
| [pong](examples/pong/)                   | Camera2D、keyboard／pointer／gamepad API、計分                                                                                                                  |
| [cube3d](examples/cube3d/)               | Lit cube／sphere、depth、2D overlay；Canvas2D 明確不跑 3D                                                                                                       |
| [fallback-demo](examples/fallback-demo/) | Backend selector、capabilities、Sprite／Primitive／Mesh                                                                                                         |
| [showcase](examples/showcase/)           | 同 Scene 2D＋3D＋audio、volume、Scene switch／cleanup                                                                                                           |
| [advanced3d](examples/advanced3d/)       | Group、OrbitControls／picking、glTF skin、PBR／shadow／HDR bloom、24 instances                                                                                  |
| [gameplay2d](examples/gameplay2d/)       | P13–P20 real root consumer: graphics／drag/actions/camera／physics/maps/particles／preload/audio／transitions；GPU/GL native effects, Canvas explicit rejection |
| [physics2d](examples/physics2d/)         | Static/dynamic bodies, circle/box/polygon, materials, sensor Trigger2D, gravity control                                                                         |
| [particles2d](examples/particles2d/)     | ParticleEmitter presets (fountain/fire/snow/trail), bursts, nozzles, additive isolated layer                                                                    |
| [tilemap2d](examples/tilemap2d/)         | Two TileMap layers, solid tile colliders, Camera2D follow/dead zone/bounds/shake/zoom                                                                           |
| [transitions2d](examples/transitions2d/) | fade／crossfade／slide between three Scenes, easing／duration／blockInput, cancel by newer request, Scene timers                                                |
| [ui2d](examples/ui2d/)                   | Text2D, SpriteFont／SpriteText, NineSlice, ScreenElement HUD, accessible pointer buttons                                                                        |
| [input-lab](examples/input-lab/)         | Live Keyboard／Pointer／Gamepad state, runtime-rebindable ActionMap                                                                                             |
| [audio-lab](examples/audio-lab/)         | Gesture unlock, OPM music／SFX, PCM sample, channel volumes, PreloadBatch progress                                                                              |
| [pbr3d](examples/pbr3d/)                 | PBR metallic／roughness grid, shadows, point light, environment, fog, exposure／bloom                                                                           |
| [instancing3d](examples/instancing3d/)   | Animated InstancedMesh batches, frustum-culled probe meshes, RenderStats, unclamped RAF fps                                                                     |
| [picking3d](examples/picking3d/)         | Nested Groups, OrbitControls, Raycaster picking, perspective／orthographic switch, reparenting                                                                  |
| [gltf3d](examples/gltf3d/)               | GLTFLoader skinned clip playback, MorphTargets driven by sliders and a weights keyframe clip                                                                    |

`cube3d`, `fallback-demo`, `showcase`, `physics2d`, `particles2d`, `tilemap2d`, `transitions2d`, `ui2d`, `input-lab` and `audio-lab` accept `?renderer=auto|webgpu|webgl2|canvas2d`; `pbr3d`, `instancing3d`, `picking3d` and `gltf3d` are 3D-only and show a clear message on Canvas2D. Canvas2D showcase retains 2D + audio and omits 3D. In `particles2d`, world-space emitters inside an additive `IsolatedGroup2D` rendered nothing in the recorded Canvas2D probe, so fire emits in local space there.

## Scene／Core World

```ts
import { Game, Scene, GameObject } from 'xyz.js';

class MovingScene extends Scene {
  player = this.add(new GameObject());
  override update(dt: number): void {
    this.player.position.x += 120 * dt;
  }
}
const game = await Game.create({ canvas: '#game' });
await game.setScene(new MovingScene());
game.start();
await game.setScene(new Scene());
game.destroy();
```

Scene 是 world 容器；GameObject 無視覺外觀，Sprite 加上貼圖呈現。切換先準備新 Scene，成功才清理舊 Scene；失敗保留舊 Scene，取消時提供 AbortSignal。Scene owns its objects; successful switching destroys the old Scene, while preparation failure preserves it. Scene は Entity ではなく lifecycle 容器であり、切替失敗時は旧 Scene を保持します。詳見 [生命週期契約](docs/TECHNICAL-zh.md#10-core-worldp02)。

## Texture／Sprite

```ts
import { Scene, Sprite } from 'xyz.js';

const texture = await game.assets.loadTexture('/image.png');
const scene = new Scene();
scene.add(new Sprite({ texture, position: [160, 120], opacity: 0.75 }));
await game.setScene(scene);
game.start();
```

`/examples/sprite/` demonstrates shared textures, transforms, opacity and z-order. Sprite destruction does not destroy its shared Texture; `game.assets` owns cached textures until Game destruction. Anchor defaults to the image center; coordinates use logical CSS pixels, right/down positive.

## Camera／Input

`scene.camera2D.position` is the world coordinate at the viewport's top-left; `zoom` scales both axes uniformly. `worldToScreen` and `screenToWorld` use logical pixels, independent of DPR. `game.input.keyboard.isDown('ArrowUp')`, `.wasPressed(code)`, `.wasReleased(code)` expose held/edge state. Pointer uses the same methods with button numbers and `.position`; `game.input.gamepads` retains browser slot indices. Edges are available during Scene updates and cleared afterward. Blur, hidden pages, pause and destruction clear held state.

## 3D

```ts
import { Mesh, Geometry, TextureMaterial } from 'xyz.js';
const cube = scene.add(
  new Mesh({
    geometry: Geometry.cube(),
    material: new TextureMaterial({ texture, color: [1, 0.8, 0.6] }),
    position: [0, 0, 0],
  }),
);
cube.rotation.setFromEuler(0.2, 0.5, 0);
scene.camera3D.position.set(0, 0, 5);
```

`Geometry.sphere()`, `.plane()`, `.quad()` and custom indexed position/normal/UV data are supported. Index topology stays immutable; after deliberately changing vertex data, call `geometry.markUpdated()` to increment its version and notify GPU upload caches. Angles are radians; cameras look along local −Z. Legacy TextureMaterial keeps ambient/directional diffuse lighting. See [advanced 3D contracts](docs/TECHNICAL.md#21-advanced-3d-p09p12) and [usage](docs/USAGE.md#11-advanced-3d).

## Compatibility

`auto` initializes backends on isolated canvases and copies the selected output to the original canvas through Canvas2D. This preserves DOM/input ownership and permits fallback after context binding, at the cost of one presentation copy per frame. Explicit `webgpu`, `webgl2`, or `canvas2d` renders directly. `Primitive2D.rectangle(width,height,color)` and `.circle(radius,color)` asynchronously create owned rasterized shapes usable on all backends. `cube3d/?renderer=canvas2d` explicitly reports that 3D is unavailable.

## Audio

```ts
const sound = await game.audio.load('/sound.json');
// Inside a user gesture:
await game.audio.unlock();
sound.play({ channel: 'sfx' });
game.audio.master.volume = 0.8;
```

JSON contains an official OPM `voice` and nonempty `notes: [{ note: 60, time: 0, duration: 0.2 }]` (MIDI 0–127; time ≥0 and duration (0,60] seconds). Optional `channel`, `loop`, and `duration` select defaults and loop period; the period cannot end before the last note. `music`, `sfx`, `ui`, and `master` expose volume 0–1. Playback belongs to the current Scene unless another `scene` is provided or `persistent: true`; without a current Scene it lasts until stopped/ended or Game destruction. Scene teardown cancels its nonpersistent notes and release tails. Game pause does not pause audio. The eight-slot budget includes release; only the oldest SFX can be stolen, and a saturated budget with no SFX skips the incoming note. Eight isolated official OPM instances prevent global voice stealing from cutting BGM, at the cost of eight AudioContexts/worklets. See [sample JSON](examples/sprite/sfx.json), [vendor provenance](vendor/opm/manifest.json), and [technical details](docs/TECHNICAL.md).

## Diagnostics & benchmark

`import { logger } from 'xyz.js'; logger.level = 'debug';` enables backend diagnostics. Levels: `debug`, `info`, `warn` (default), `error`, `silent`; methods use the `[XYZ]` prefix.

Run `npx pnpm@12.6.0 dev`, open `/benchmarks/sprites/`, and keep the tab visible. The [benchmark source](benchmarks/sprites/) uses 1,000 moving resident Sprites, one texture, 1280×720 backing, DPR 1, 120 warmup and 600 measured frames. Default is direct WebGPU; `?renderer=auto`, `webgl2` or `canvas2d` selects another path. It drives Renderer from its own RAF rather than Game.start, reporting frame intervals and CPU begin/render/end submission separately; it is not an end-to-end Game Loop or GPU/GC timing measurement. P08 recorded **59.9988 fps**, CPU submit mean **0.6358 ms**, p95 **1.2 ms**; no cross-device guarantee.

Post-P08 maintenance removes redundant viewport uploads and unconditional ECS compaction, and fixes held keys after focus moves into an input field. The subsequent run passed **75 tests**; timing did **not** establish a CPU/FPS improvement. Before/after measurements and limits are recorded in [ACCEPTANCE.md](ACCEPTANCE.md).

## Asset safety limits

URL-loaded images are capped at 8 MiB of response bytes; audio JSON at 1 MiB and 16,384 notes. Texture dimensions are capped at 8,192 per side and 4,194,304 pixels, including `Texture.fromImage`. Limits are centralized in `src/data/assets.ts`; oversized assets reject rather than truncate or downscale.

All browser-supported image formats remain available. Pixel validation occurs **after decoding**, so these limits do not prevent transient decoder memory amplification. They are per-asset limits, not a total cache/memory budget. Only load trusted images where that residual risk is unacceptable. Security verification and remaining limits are recorded in [ACCEPTANCE.md](ACCEPTANCE.md).

## Post-v1.0 gameplay additions / v1.0 後遊戲開發擴充

- **Text2D**：引擎內多行文字、非同步更新與自有貼圖清理，沿用三種 renderer 的 Sprite 路徑。
- **Scene timers**：`scene.timers.after()`／`every()` 使用模擬秒數，暫停凍結、Scene 清理取消，無須自行維護 browser timeout。
- Pong 現在使用畫布內計分、延遲發球，並提供 Pause／Resume／Restart scene。
- Text2D provides owned, asynchronously updateable text Sprites; scene timers follow simulation time and scene lifetime. See the bilingual usage guides for examples.
- These additions ship in **v1.1** (package **1.1.0**), not the previously published **v1.0** release. 新功能納入 v1.1；既有 v1.0 tag 與發佈附件保持不變，未發佈至 npm。
