# Spin Picker

A single-page roulette wheel picker built with plain HTML, CSS, and JavaScript — no dependencies, no build step.
HTML・CSS・JavaScriptのみで動作する、シンプルなルーレット選択アプリです。外部ライブラリやビルド不要。

**Live Demo:** https://sasekazu.github.io/spin-picker/

## Usage / 使い方

1. Open `index.html` in a browser.
   ブラウザで `index.html` を開きます。
2. Enter one item per line in the text box. Blank lines are ignored, and pasting a column from Excel works too.
   テキスト欄に1行1項目で入力します。空行は無視され、Excelからの列コピペにも対応しています。
3. Click **START** to spin, then **STOP** to decide the winner.
   **START** で回転を開始し、**STOP** で結果を決定します。

## Features / 特徴

- Wheel auto-updates as you edit the item list — 項目編集にあわせてルーレットが自動更新
- Every item has an equal chance of being selected — 全項目が同確率で選ばれる
- Responsive layout for both PC and mobile — PC・スマートフォン両対応のレスポンシブデザイン

## Files

- `index.html` — page structure
- `style.css` — styling
- `script.js` — wheel drawing and spin logic
