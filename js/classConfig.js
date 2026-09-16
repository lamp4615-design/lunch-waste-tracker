// ========== 班級圖案與顏色配置 ==========
const classConfig = {
    "一年甲班": { emoji: "🌱", color: "#4CAF50", grade: "一年級" },
    "一年乙班": { emoji: "🌿", color: "#66BB6A", grade: "一年級" },

    "二年甲班": { emoji: "🦋", color: "#AB47BC", grade: "二年級" },
    "二年乙班": { emoji: "🌸", color: "#EC407A", grade: "二年級" },

    "三年甲班": { emoji: "🔥", color: "#FFA726", grade: "三年級" },
    "三年乙班": { emoji: "⭐", color: "#FDD835", grade: "三年級" },

    "四年甲班": { emoji: "🎯", color: "#29B6F6", grade: "四年級" },
    "四年乙班": { emoji: "🚀", color: "#42A5F5", grade: "四年級" },

    "五年甲班": { emoji: "👑", color: "#FFD54F", grade: "五年級" },
    "五年乙班": { emoji: "💎", color: "#FFB74D", grade: "五年級" },

    "六年甲班": { emoji: "🏆", color: "#FF6B6B", grade: "六年級" },
    "六年乙班": { emoji: "✨", color: "#EF5350", grade: "六年級" },
};

// 取得班級信息
function getClassInfo(className) {
    return classConfig[className] || {
        emoji: "📚",
        color: "#999",
        grade: "未知"
    };
}

// 取得所有班級列表
function getAllClasses() {
    return Object.keys(classConfig);
}

// 取得某年級的所有班級
function getClassesByGrade(grade) {
    return Object.keys(classConfig).filter(
        className => classConfig[className].grade === grade
    );
}
