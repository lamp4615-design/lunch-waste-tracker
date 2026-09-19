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
│   ├── main.js         資料載入、Tab 切換、表格與圖表渲染邏輯
│   └── record.js        「現場紀錄」表單邏輯（年級/班級連動、送出秤重紀錄）
├── gas/
│   └── Code.gs          Google Apps Script 後端（試算表讀寫、API）
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

API 需支援以下 GET action，並回傳 JSON：

- `getRecords`：每筆抽測紀錄陣列（含 日期、班級、年級、抽測餐點、班級人數、廚餘重量(g)、每人平均(g)）
- `getStats`：各班統計陣列（含 班級、年級、進步率(%)、第一次平均(g)、最後一次平均(g)）
- `getConfig`：設定物件（含 更新時間）
- `getClasses`：全校班級清單（含 班級、年級）

以及兩個 POST action，供「現場紀錄」表單使用：

- `verifyPassword`：body 為 `{ action: "verifyPassword", password }`，密碼正確才回傳 `{ success: true }`
- `addRecord`：body 為 `{ action: "addRecord", password, date, className, grade, dish, people, waste }`，`dish` 需為「主食／主菜／副菜／蔬菜／附餐」其中之一，密碼與資料皆通過驗證才會寫入，成功回傳 `{ success: true, record: {...} }`

## 後端部署（Google Apps Script）

1. 開啟 Apps Script 專案，將 [gas/Code.gs](gas/Code.gs) 的內容貼上取代原本的程式碼。
2. 執行一次 `initializeSheets`，會自動建立/重建「設定檔」「班級清單」「班級統計」「秤重紀錄表」四張工作表。
   - 「班級清單」會自動產生全校 12 個班級：一～六年級，每年級僅「甲班」「乙班」，與前端 [js/classConfig.js](js/classConfig.js) 的班級名稱一致。
   - 「設定檔」會產生一列「現場紀錄密碼」，預設值是「請自行修改此密碼」，**部署後請務必到試算表把這一列改成你要的實際密碼**，否則現場紀錄表單無法驗證通過。
3. 部署為網頁應用程式（執行身分：我；存取權限：任何人），取得 `.../exec` 網址。
4. 將該網址填入 [js/main.js](js/main.js) 的 `API_URL`（記得保留結尾的 `?action=`）。「現場紀錄」表單會自動以同一網址（去掉 `?action=`）送出 POST 請求。

## 現場紀錄密碼鎖

「✏️ 現場紀錄」分頁前會先出現密碼輸入畫面，只有輸入「設定檔」工作表中「現場紀錄密碼」欄位設定的值才能解鎖表單。密碼驗證與每一筆 `addRecord` 寫入都是在 Google Apps Script 後端檢查，前端頁面本身不含密碼明文，也無法被略過。之後若要更換密碼，直接到試算表「設定檔」分頁修改該欄位即可，不需要重新部署。
