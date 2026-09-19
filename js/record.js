// ========== 現場秤重登記 ==========
const GRADES_IN_ORDER = ["一年級", "二年級", "三年級", "四年級", "五年級", "六年級"];
const POST_URL = API_URL.split('?')[0];

document.addEventListener('DOMContentLoaded', () => {
    initRecordForm();
});

function initRecordForm() {
    const dateInput = document.getElementById('inputDate');
    const gradeSelect = document.getElementById('inputGrade');
    const classSelect = document.getElementById('inputClass');
    const peopleInput = document.getElementById('inputPeople');
    const wasteInput = document.getElementById('inputWaste');
    const form = document.getElementById('wasteForm');

    // 預設日期為今天
    dateInput.valueAsDate = new Date();

    // 建立年級選項
    GRADES_IN_ORDER.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade;
        option.textContent = grade;
        gradeSelect.appendChild(option);
    });

    // 年級變更時，更新班級選項
    gradeSelect.addEventListener('change', () => {
        const grade = gradeSelect.value;
        const classNames = getClassesByGrade(grade);

        classSelect.innerHTML = '';
        classSelect.disabled = classNames.length === 0;

        if (classNames.length === 0) {
            classSelect.innerHTML = '<option value="" disabled selected>此年級無班級</option>';
            return;
        }

        classSelect.innerHTML = '<option value="" disabled selected>請選擇班級</option>';
        classNames.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelect.appendChild(option);
        });
    });

    // 即時預覽每人平均
    [peopleInput, wasteInput].forEach(input => {
        input.addEventListener('input', updateAvgPreview);
    });

    form.addEventListener('submit', handleSubmit);
}

function updateAvgPreview() {
    const people = parseFloat(document.getElementById('inputPeople').value);
    const waste = parseFloat(document.getElementById('inputWaste').value);
    const preview = document.getElementById('avgPreview');

    if (people > 0 && waste >= 0) {
        preview.textContent = `每人平均：${(waste / people).toFixed(1)}g`;
    } else {
        preview.textContent = '每人平均：--';
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const messageEl = document.getElementById('formMessage');

    const payload = {
        action: 'addRecord',
        date: document.getElementById('inputDate').value,
        grade: document.getElementById('inputGrade').value,
        className: document.getElementById('inputClass').value,
        dish: document.getElementById('inputDish').value.trim(),
        people: document.getElementById('inputPeople').value,
        waste: document.getElementById('inputWaste').value
    };

    submitBtn.disabled = true;
    submitBtn.textContent = '送出中...';
    messageEl.className = 'form-message';
    messageEl.textContent = '';

    try {
        const response = await fetch(POST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || '送出失敗');
        }

        messageEl.className = 'form-message success';
        messageEl.textContent = `✅ 已登記：${payload.className} ${payload.dish}，每人平均 ${result.record['每人平均(g)']}g`;

        e.target.reset();
        document.getElementById('inputDate').valueAsDate = new Date();
        document.getElementById('inputClass').innerHTML = '<option value="" disabled selected>請先選擇年級</option>';
        document.getElementById('inputClass').disabled = true;
        updateAvgPreview();

        // 重新載入資料，讓排行榜與紀錄同步最新結果
        if (typeof loadAllData === 'function') {
            loadAllData();
        }
    } catch (error) {
        console.error('送出失敗:', error);
        messageEl.className = 'form-message error';
        messageEl.textContent = `❌ ${error.message}`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '送出紀錄';
    }
}
