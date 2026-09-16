# 光盤小超人・廚餘減量大作戰

台中市大安區大安國民小學的營養午餐廚餘減量追蹤網頁,顯示各班進步排行榜、進步率圖表與詳細紀錄。

## 資料夾結構

```
lunch-waste-tracker/
├── index.html          頁面結構
├── css/
│   └── style.css       樣式
├── js/
│   ├── classConfig.js  班級 emoji / 顏色 / 年級配置
│   └── main.js         資料載入、Tab 切換、表格與圖表渲染邏輯
└── README.md
```

## 執行方式

資料是透過 `fetch` 向 Google Apps Script API 取得,瀏覽器對 `fetch` 有安全限制,不建議直接用檔案總管雙擊開啟 `index.html`,請用本機伺服器啟動:

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx serve .
```

啟動後於瀏覽器開啟 `http://localhost:8000` 即可。

## 設定資料來源

編輯 `js/main.js` 第一行的 `API_URL`,換成你自己 Google Apps Script 部署後的網址：

```js
const API_URL = "https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercopy?action=";
```

API 需支援以下三個 action，並回傳 JSON：

- `getRecords`：每筆抽測紀錄陣列（含 日期、班級、年級、抽測餐點、班級人數、廚餘重量(g)、每人平均(g)）
- `getStats`：各班統計陣列（含 班級、年級、進步率(%)、第一次平均(g)、最後一次平均(g)）
- `getConfig`：設定物件（含 更新時間）
