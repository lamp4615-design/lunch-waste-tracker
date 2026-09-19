// ==================== 設定區 ====================
const SPREADSHEET_ID = "1mkuZLWej5MUQLxPm9AYOzzpntPlSJwk54UGGqOtYAvs";
const RECORDS_SHEET = "秤重紀錄表";
const STATS_SHEET = "班級統計";
const CONFIG_SHEET = "設定檔";
const CLASS_SHEET = "班級清單";

// 全校班級：六個年級，每個年級只有甲班與乙班
const GRADE_NAMES = ["一年級", "二年級", "三年級", "四年級", "五年級", "六年級"];
const GRADE_NUMERALS = ["一", "二", "三", "四", "五", "六"];

// 現場登記可選的抽測餐點類別
const DISH_OPTIONS = ["主食", "主菜", "副菜", "蔬菜", "附餐"];

// 設定檔中儲存現場登記密碼的項目名稱
const PASSWORD_CONFIG_KEY = "現場紀錄密碼";

function getAllClassDefinitions() {
  const classes = [];
  GRADE_NAMES.forEach((grade, i) => {
    const numeral = GRADE_NUMERALS[i];
    classes.push({ className: `${numeral}年甲班`, grade: grade });
    classes.push({ className: `${numeral}年乙班`, grade: grade });
  });
  return classes;
}

// ==================== 初始化函數（第一次部署時執行）====================
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // ✅ 先確保所有 Sheet 都存在
  createSheetIfNotExists(ss, CONFIG_SHEET);
  createSheetIfNotExists(ss, CLASS_SHEET);
  createSheetIfNotExists(ss, STATS_SHEET);
  createSheetIfNotExists(ss, RECORDS_SHEET);

  // 等待 1 秒確保 Sheet 建立完成
  Utilities.sleep(1000);

  // ✅ 再初始化各表單內容
  initializeConfig(ss);
  initializeClasses(ss);
  initializeStats(ss);
  initializeRecords(ss);

  console.log("✅ 所有表單初始化完成！");
}

// ==================== 輔助函數：建立 Sheet ====================
function createSheetIfNotExists(ss, sheetName) {
  let sheet = null;
  try {
    sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      console.log(`✓ Sheet "${sheetName}" 已存在`);
      return sheet;
    }
  } catch (e) {
    // Sheet 不存在，建立新的
  }

  // 建立新 Sheet
  sheet = ss.insertSheet(sheetName);
  console.log(`✓ 建立新 Sheet "${sheetName}"`);
  return sheet;
}

// ==================== 初始化設定檔 ====================
function initializeConfig(ss) {
  let sheet = ss.getSheetByName(CONFIG_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG_SHEET);
  }

  // 清空現有數據
  if (sheet.getLastRow() > 0) {
    sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();
  }

  const headers = ["設定項目", "設定值"];
  const configData = [
    ["活動名稱", "光盤小超人・廚餘減量大作戰"],
    ["活動年度", "2024"],
    ["抽測總次數", "3"],
    [PASSWORD_CONFIG_KEY, "請自行修改此密碼"],
    ["更新時間", new Date().toLocaleString("zh-TW")]
  ];

  sheet.appendRow(headers);
  configData.forEach(row => sheet.appendRow(row));

  // 設定格式
  sheet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#4285f4").setFontColor("white");
  sheet.autoResizeColumns(1, 2);
}

// ==================== 初始化全校班級清單 ====================
function initializeClasses(ss) {
  let sheet = ss.getSheetByName(CLASS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CLASS_SHEET);
  }

  // 清空現有數據
  if (sheet.getLastRow() > 0) {
    sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();
  }

  const headers = ["班級", "年級"];
  const classData = getAllClassDefinitions().map(c => [c.className, c.grade]);

  sheet.appendRow(headers);
  classData.forEach(row => sheet.appendRow(row));

  // 設定格式
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#8e24aa").setFontColor("white");
  sheet.autoResizeColumns(1, headers.length);
}

// ==================== 初始化班級統計 ====================
function initializeStats(ss) {
  let sheet = ss.getSheetByName(STATS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(STATS_SHEET);
  }

  // 清空現有數據
  if (sheet.getLastRow() > 0) {
    sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();
  }

  const headers = ["班級", "年級", "第一次平均(g)", "最後一次平均(g)", "進步率(%)", "排名", "總次數"];
  sheet.appendRow(headers);

  // 設定格式
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#34a853").setFontColor("white");
  sheet.autoResizeColumns(1, headers.length);
}

// ==================== 初始化秤重紀錄 ====================
function initializeRecords(ss) {
  let sheet = ss.getSheetByName(RECORDS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(RECORDS_SHEET);
  }

  // 清空現有數據
  if (sheet.getLastRow() > 0) {
    sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).clearContent();
  }

  const headers = ["日期", "班級", "年級", "抽測餐點", "班級人數", "廚餘重量(g)", "每人平均(g)", "狀態"];
  sheet.appendRow(headers);

  // 設定格式
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#ea4335").setFontColor("white");
  sheet.autoResizeColumns(1, headers.length);
}

// ==================== 取得秤重紀錄 ====================
function getRecords() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(RECORDS_SHEET);
  const data = sheet.getDataRange().getValues();

  const headers = data[0];
  const records = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === "") break;

    const record = {};
    headers.forEach((header, index) => {
      let value = data[i][index];
      if (header === "日期" && value instanceof Date) {
        value = Utilities.formatDate(value, "Asia/Taipei", "yyyy-MM-dd");
      }
      record[header] = value;
    });
    records.push(record);
  }

  return jsonOutput(records);
}

// ==================== 取得班級統計 ====================
function getStats() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(STATS_SHEET);
  const range = sheet.getDataRange();
  const data = range.getValues();
  const formats = range.getNumberFormats();

  const headers = data[0];
  const stats = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === "") break;

    const stat = {};
    headers.forEach((header, index) => {
      let value = data[i][index];
      const isPercentFormat = formats[i][index].indexOf('%') !== -1;
      if (typeof value === "number" && isPercentFormat) {
        value = Math.round(value * 1000) / 10; // 0.4 -> 40
      }
      stat[header] = value;
    });
    stats.push(stat);
  }

  return jsonOutput(stats);
}

// ==================== 取得設定 ====================
function getConfig() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG_SHEET);
  const data = sheet.getDataRange().getValues();

  const config = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === "") break;
    config[data[i][0]] = data[i][1];
  }

  return jsonOutput(config);
}

// ==================== 讀取設定檔中的單一設定值 ====================
function getConfigValue(key) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG_SHEET);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      return data[i][1];
    }
  }
  return null;
}

// ==================== 取得全校班級清單 ====================
function getClasses() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CLASS_SHEET);

  // 若尚未初始化，直接回傳程式內建的班級定義
  if (!sheet || sheet.getLastRow() < 2) {
    return jsonOutput(getAllClassDefinitions());
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const classes = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === "") break;
    const item = {};
    headers.forEach((header, index) => {
      item[header] = data[i][index];
    });
    classes.push(item);
  }

  return jsonOutput(classes);
}

// ==================== Web 應用入口（讀取）====================
function doGet(e) {
  const action = e.parameter.action;

  if (action === "getRecords") {
    return getRecords();
  } else if (action === "getStats") {
    return getStats();
  } else if (action === "getConfig") {
    return getConfig();
  } else if (action === "getClasses") {
    return getClasses();
  } else {
    return HtmlService.createHtmlOutput("✅ API Ready");
  }
}

// ==================== Web 應用入口（寫入）====================
function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput({ success: false, error: "無法解析請求內容" });
  }

  if (payload.action === "verifyPassword") {
    return handleVerifyPassword(payload);
  }

  if (payload.action === "addRecord") {
    return handleAddRecord(payload);
  }

  return jsonOutput({ success: false, error: `不支援的 action: ${payload.action}` });
}

// ==================== 密碼比對（統一轉成文字，避免試算表存成數字時比對失敗）====================
function isPasswordCorrect(inputPassword) {
  const correctPassword = getConfigValue(PASSWORD_CONFIG_KEY);
  if (correctPassword === null || correctPassword === "") {
    return { ok: false, error: "尚未設定登記密碼，請聯絡系統管理者" };
  }
  if (String(inputPassword).trim() !== String(correctPassword).trim()) {
    return { ok: false, error: "密碼錯誤" };
  }
  return { ok: true };
}

// ==================== 驗證現場登記密碼 ====================
function handleVerifyPassword(payload) {
  const result = isPasswordCorrect(payload.password);
  if (!result.ok) {
    return jsonOutput({ success: false, error: result.error });
  }
  return jsonOutput({ success: true });
}

// ==================== 新增紀錄（現場秤重登記用）====================
function handleAddRecord(payload) {
  const { date, className, grade, dish, people, waste, password } = payload;

  const passwordCheck = isPasswordCorrect(password);
  if (!passwordCheck.ok) {
    return jsonOutput({ success: false, error: passwordCheck.error });
  }

  const peopleNum = Number(people);
  const wasteNum = Number(waste);

  if (!date || !className || !grade || !dish) {
    return jsonOutput({ success: false, error: "請填寫日期、班級、年級與抽測餐點" });
  }
  if (DISH_OPTIONS.indexOf(dish) === -1) {
    return jsonOutput({ success: false, error: `抽測餐點需為：${DISH_OPTIONS.join("、")} 其中之一` });
  }
  if (!Number.isFinite(peopleNum) || peopleNum <= 0) {
    return jsonOutput({ success: false, error: "班級人數需為大於 0 的數字" });
  }
  if (!Number.isFinite(wasteNum) || wasteNum < 0) {
    return jsonOutput({ success: false, error: "廚餘重量需為不小於 0 的數字" });
  }

  const validClass = getAllClassDefinitions().some(c => c.className === className && c.grade === grade);
  if (!validClass) {
    return jsonOutput({ success: false, error: `班級「${className}」不存在於全校班級清單中` });
  }

  const record = addRecord(date, className, grade, dish, peopleNum, wasteNum);
  return jsonOutput({ success: true, record: record });
}

function addRecord(date, className, grade, dish, people, waste) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(RECORDS_SHEET);
  const avgWaste = Math.round((waste / people) * 100) / 100;

  sheet.appendRow([date, className, grade, dish, people, waste, avgWaste, "已完成"]);
  recalculateStats(ss);

  return {
    日期: date, 班級: className, 年級: grade, 抽測餐點: dish,
    班級人數: people, "廚餘重量(g)": waste, "每人平均(g)": avgWaste, 狀態: "已完成"
  };
}

// ==================== 依秤重紀錄重新計算班級統計（每次新增紀錄後自動執行）====================
function recalculateStats(ss) {
  ss = ss || SpreadsheetApp.openById(SPREADSHEET_ID);
  const recordsSheet = ss.getSheetByName(RECORDS_SHEET);
  const data = recordsSheet.getDataRange().getValues();
  const headers = data[0];

  const idxDate = headers.indexOf("日期");
  const idxClass = headers.indexOf("班級");
  const idxGrade = headers.indexOf("年級");
  const idxAvg = headers.indexOf("每人平均(g)");

  const grouped = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const className = row[idxClass];
    if (!className) continue;

    if (!grouped[className]) {
      grouped[className] = { grade: row[idxGrade], entries: [] };
    }
    grouped[className].entries.push({ date: row[idxDate], avg: Number(row[idxAvg]) });
  }

  const statsRows = Object.keys(grouped).map(className => {
    const group = grouped[className];
    const sorted = group.entries.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    const first = sorted[0].avg;
    const last = sorted[sorted.length - 1].avg;
    const progress = first > 0 ? Math.round(((first - last) / first) * 1000) / 10 : 0;

    return {
      className: className,
      grade: group.grade,
      first: first,
      last: last,
      progress: progress,
      count: sorted.length
    };
  });

  statsRows.sort((a, b) => b.progress - a.progress);
  statsRows.forEach((row, index) => { row.rank = index + 1; });

  const statsSheet = ss.getSheetByName(STATS_SHEET);
  const existingRows = statsSheet.getMaxRows() - 1;
  if (existingRows > 0) {
    statsSheet.getRange(2, 1, existingRows, 7).clearContent();
  }
  if (statsRows.length > 0) {
    const values = statsRows.map(r => [r.className, r.grade, r.first, r.last, r.progress, r.rank, r.count]);
    statsSheet.getRange(2, 1, values.length, 7).setValues(values);
  }
}

// ==================== 共用：JSON 輸出 ====================
function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}
