// ========== 配置 ==========
const API_URL = "https://script.google.com/macros/s/AKfycbxejl78G3DKP9jR6aUCvGMkt2bzx1cPdDHLWL6YyG0PkQ9mGBN5hiRV4F1JK5c57sZnDA/exec?action=";
let progressChart = null;

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    loadAllData();
});

// ========== Tab 切換 ==========
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(tabName).classList.add('active');

            // 圖表重新調整（解決大小問題）
            if (tabName === 'progress-chart' && progressChart) {
                setTimeout(() => progressChart.resize(), 100);
            }
        });
    });
}

// ========== 載入所有資料 ==========
async function loadAllData() {
    try {
        const [records, stats, config] = await Promise.all([
            fetchData('getRecords'),
            fetchData('getStats'),
            fetchData('getConfig')
        ]);

        document.getElementById('updateTime').textContent =
            config['更新時間'] || new Date().toLocaleString('zh-TW');

        displayStats(stats);
        displayProgressChart(stats);
        displayClassCards(stats);
        displayRecords(records);

    } catch (error) {
        console.error('Error loading data:', error);
        alert('❌ 資料載入失敗，請檢查網路連線或 API URL');
    }
}

// ========== 發送 API 請求 ==========
async function fetchData(action) {
    const response = await fetch(API_URL + action);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
}

// ========== 顯示排行榜表格 ==========
function displayStats(stats) {
    const tbody = document.getElementById('statsBody');
    tbody.innerHTML = '';

    if (stats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">尚無資料</td></tr>';
        return;
    }

    // 排序：進步率最高優先
    stats.sort((a, b) => {
        const progressA = parseFloat(a['進步率(%)']) || 0;
        const progressB = parseFloat(b['進步率(%)']) || 0;
        return progressB - progressA;
    });

    stats.forEach((stat, index) => {
        const classInfo = getClassInfo(stat['班級']);
        const medal = ['🥇', '🥈', '🥉'][index] || `${index + 1}.`;
        const badge = index < 3 ? '⭐ ' : '';

        const row = `
            <tr class="rank-${index + 1}">
                <td><strong>${medal}</strong></td>
                <td>
                    <span class="class-badge" style="background: ${classInfo.color}">
                        ${classInfo.emoji} ${stat['班級']}
                    </span>
                </td>
                <td>${stat['年級']}</td>
                <td>
                    <div class="progress-rate">
                        <div class="progress-bar" style="width: ${stat['進步率(%)']}%; background: ${classInfo.color};"></div>
                        <span>${stat['進步率(%)'] || '--'}%</span>
                    </div>
                </td>
                <td>${stat['第一次平均(g)']}g → ${stat['最後一次平均(g)']}g</td>
                <td>${badge}${index < 3 ? '前三名' : '加油中'}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ========== 進步率長條圖 ==========
function displayProgressChart(stats) {
    if (!stats || stats.length === 0) {
        document.querySelector('.chart-wrapper').innerHTML =
            '<p class="loading">尚無資料</p>';
        return;
    }

    // 排序
    const sortedStats = [...stats].sort((a, b) => {
        const progressA = parseFloat(a['進步率(%)']) || 0;
        const progressB = parseFloat(b['進步率(%)']) || 0;
        return progressB - progressA;
    });

    // 準備資料
    const labels = sortedStats.map(s => {
        const classInfo = getClassInfo(s['班級']);
        return `${classInfo.emoji} ${s['班級']}`;
    });

    const data = sortedStats.map(s => parseFloat(s['進步率(%)']) || 0);
    const colors = sortedStats.map(s => getClassInfo(s['班級']).color);

    // 銷毀舊圖表
    if (progressChart) {
        progressChart.destroy();
    }

    // 建立新圖表
    const ctx = document.getElementById('progressChart').getContext('2d');
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '進步率 (%)',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 2,
                borderRadius: 10,
                barThickness: 50,
            }]
        },
        options: {
            indexAxis: 'y', // 水平長條
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `進步率: ${context.parsed.x}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        suffix: '%'
                    }
                }
            }
        }
    });
}

// ========== 班級進度卡片 ==========
function displayClassCards(stats) {
    const container = document.getElementById('classCardsContainer');
    container.innerHTML = '';

    if (!stats || stats.length === 0) {
        container.innerHTML = '<p class="loading">尚無資料</p>';
        return;
    }

    // 排序
    const sortedStats = [...stats].sort((a, b) => {
        const progressA = parseFloat(a['進步率(%)']) || 0;
        const progressB = parseFloat(b['進步率(%)']) || 0;
        return progressB - progressA;
    });

    sortedStats.forEach((stat, index) => {
        const classInfo = getClassInfo(stat['班級']);
        const progress = parseFloat(stat['進步率(%)']) || 0;
        const improvement = parseFloat(stat['第一次平均(g)']) - parseFloat(stat['最後一次平均(g)']);

        const card = `
            <div class="class-card" style="border-left: 4px solid ${classInfo.color}">
                <div class="card-header">
                    <h3>${classInfo.emoji} ${stat['班級']}</h3>
                    ${index < 3 ? `<span class="medal">🏅 Top ${index + 1}</span>` : ''}
                </div>

                <div class="card-stat">
                    <div class="stat-item">
                        <span class="stat-label">進步率</span>
                        <span class="stat-value" style="color: ${classInfo.color};">${progress}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">廚餘減少</span>
                        <span class="stat-value" style="color: #4CAF50;">${improvement.toFixed(1)}g</span>
                    </div>
                </div>

                <div class="progress-container">
                    <div class="progress-bar-full" style="background: ${classInfo.color}; width: ${progress}%"></div>
                </div>

                <div class="card-detail">
                    <p>第一次：<strong>${stat['第一次平均(g)']}g</strong></p>
                    <p>最後一次：<strong>${stat['最後一次平均(g)']}g</strong></p>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// ========== 顯示詳細紀錄 ==========
let allRecords = [];

function displayRecords(records) {
    allRecords = records;
    filterAndDisplayRecords();

    document.getElementById('filterClass').addEventListener('input', filterAndDisplayRecords);
    document.getElementById('filterGrade').addEventListener('change', filterAndDisplayRecords);
}

function filterAndDisplayRecords() {
    const filterClass = document.getElementById('filterClass').value.toLowerCase();
    const filterGrade = document.getElementById('filterGrade').value;

    let filtered = allRecords.filter(record => {
        const matchClass = record['班級'].toLowerCase().includes(filterClass);
        const matchGrade = filterGrade === '' || record['年級'] === filterGrade;
        return matchClass && matchGrade;
    });

    filtered.reverse();

    const tbody = document.getElementById('recordsBody');
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">找不到相關紀錄</td></tr>';
        return;
    }

    filtered.forEach(record => {
        const classInfo = getClassInfo(record['班級']);
        const row = `
            <tr>
                <td>${record['日期']}</td>
                <td>
                    <span class="class-badge" style="background: ${classInfo.color}">
                        ${classInfo.emoji} ${record['班級']}
                    </span>
                </td>
                <td>${record['年級']}</td>
                <td>${record['抽測餐點']}</td>
                <td>${record['班級人數']}</td>
                <td>${record['廚餘重量(g)']}</td>
                <td><strong style="color: ${classInfo.color};">${record['每人平均(g)']}g</strong></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}
